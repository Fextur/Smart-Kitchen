import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KitchenItem, ShoppingListItem } from "@/types";
import { useMemo } from "react";
import { isExpiringSoon } from "@/utils/dateUtils";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";
import { useKitchen } from "./useKitchen";

export const useKitchenItems = () => {
  const queryClient = useQueryClient();
  const { kitchen } = useKitchen();

  const fetchKitchenItems = async () => {
    try {
      if (kitchen?.id) {
        const { data } = await api.get<KitchenItem[]>(
          `${API_ROUTES.products}/by-inventory/${kitchen.id}`
        );

        return data.sort((a, b) => {
          const dateA = new Date(a.latestUpdateDate || "1970-01-01").getTime();
          const dateB = new Date(b.latestUpdateDate || "1970-01-01").getTime();
          return dateB - dateA;
        });
      }
      return [];
    } catch (error) {
      console.error("Error fetching kitchen items:", error);
      throw new Error("An unexpected error occurred");
    }
  };

  const createKitchenItems = async (items: KitchenItem[]) => {
    try {
      if (kitchen?.id) {
        const itemsWithoutIds = items.map(({ id, ...rest }) => rest);

        const { data } = await api.post<KitchenItem[]>(
          `${API_ROUTES.products}/`,
          {
            products: itemsWithoutIds,
            inventoryId: kitchen.id,
          }
        );

        return data;
      }
      return [];
    } catch (error) {
      console.error("Error creating kitchen items:", error);
      throw new Error("An unexpected error occurred");
    }
  };

  const createItemsMutation = useMutation({
    mutationFn: (items: KitchenItem[]) => createKitchenItems(items),
    onSuccess: () => {
      // Use kitchen-specific query key
      queryClient.invalidateQueries({
        queryKey: ["kitchenItems", kitchen?.id],
      });
    },
  });

  const updateKitchenItem = async (
    items: (KitchenItem | ShoppingListItem)[]
  ) => {
    try {
      const { data } = await api.post<(KitchenItem | ShoppingListItem)[]>(
        `${API_ROUTES.products}/updateBulk`,
        {
          products: items,
        }
      );

      return data;
    } catch (error) {
      console.error("Error updating kitchen items:", error);
      throw new Error("An unexpected error occurred");
    }
  };

  const updateItemsMutation = useMutation({
    mutationFn: (items: (KitchenItem | ShoppingListItem)[]) =>
      updateKitchenItem(items),
    onSuccess: () => {
      // Use kitchen-specific query keys
      queryClient.invalidateQueries({
        queryKey: ["kitchenItems", kitchen?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["shoppingListItems", kitchen?.id],
      });
    },
  });

  // Use kitchen-specific query key for proper invalidation
  const { data, isLoading } = useQuery({
    queryKey: ["kitchenItems", kitchen?.id],
    queryFn: fetchKitchenItems,
    enabled: !!kitchen?.id, // Only fetch when we have a kitchen
  });

  const categorizedItems = useMemo(() => {
    if (!data) return null;

    const expiringSoon = data
      .filter(
        (item) =>
          item.expirationDate &&
          isExpiringSoon(item.expirationDate) &&
          item.size > 0
      )
      .sort((a, b) => {
        const dateA = new Date(a.latestUpdateDate || "1970-01-01").getTime();
        const dateB = new Date(b.latestUpdateDate || "1970-01-01").getTime();
        return dateB - dateA;
      });

    const empty = data
      .filter((item) => item.size <= 0)
      .map((item) => ({ ...item, expirationDate: undefined } as KitchenItem))
      .sort((a, b) => {
        const dateA = new Date(a.latestUpdateDate || "1970-01-01").getTime();
        const dateB = new Date(b.latestUpdateDate || "1970-01-01").getTime();
        return dateB - dateA;
      });

    const inKitchen = data
      .filter((item) => item.size > 0)
      .sort((a, b) => {
        const dateA = new Date(a.latestUpdateDate || "1970-01-01").getTime();
        const dateB = new Date(b.latestUpdateDate || "1970-01-01").getTime();
        return dateB - dateA;
      });

    return { expiringSoon, empty, inKitchen };
  }, [data]);

  const consumeKitchenItem = async (items: KitchenItem[]) => {
    try {
      const validItems = items.filter((item) => item.id && item.id !== "");

      if (validItems.length === 0) {
        console.warn("No valid items to consume (all items missing IDs)");
        return [];
      }

      const itemsToUpdate = validItems.map((item) => ({
        ...item,
      }));

      const { data } = await api.post<KitchenItem[]>(
        `${API_ROUTES.products}/updateBulk`,
        {
          products: itemsToUpdate,
        }
      );

      return data;
    } catch (error) {
      console.error("Error consuming kitchen items:", error);
      throw new Error("Failed to consume kitchen items");
    }
  };

  const consumeItemsMutation = useMutation({
    mutationFn: (items: KitchenItem[]) => consumeKitchenItem(items),
    onSuccess: () => {
      // Use kitchen-specific query key
      queryClient.invalidateQueries({
        queryKey: ["kitchenItems", kitchen?.id],
      });
    },
    onError: (error) => {
      console.error("Consume mutation error:", error);
    },
  });

  return {
    items: data || [],
    isLoading,
    createItemsMutation,
    updateItemsMutation,
    categorizedItems,
    consumeItemsMutation,
  };
};
