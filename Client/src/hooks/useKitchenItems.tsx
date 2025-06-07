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

        return data;
      }
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const createItemsMutation = useMutation({
    mutationFn: (items: KitchenItem[]) => createKitchenItems(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchenItems"] });
    },
  });

  const updateKitchenItem = async (
    items: (KitchenItem | ShoppingListItem)[]
  ) => {
    try {
      console.log(items);
      const { data } = await api.post<(KitchenItem | ShoppingListItem)[]>(
        `${API_ROUTES.products}/updateBulk`,
        {
          products: items,
        }
      );

      return data;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const updateItemsMutation = useMutation({
    mutationFn: (items: (KitchenItem | ShoppingListItem)[]) =>
      updateKitchenItem(items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kitchenItems"],
      });

      queryClient.invalidateQueries({
        queryKey: ["shoppingListItems"],
      });
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["kitchenItems"],
    queryFn: fetchKitchenItems,
  });

  const categorizedItems = useMemo(() => {
    if (!data) return null;
    const expiringSoon = data.filter(
      (item) =>
        item.expirationDate &&
        isExpiringSoon(item.expirationDate) &&
        item.size > 0
    );

    const empty = data
      .filter((item) => item.size <= 0)
      .map((item) => ({ ...item, expirationDate: undefined } as KitchenItem));

    const inKitchen = data.filter((item) => item.size > 0);

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
      queryClient.invalidateQueries({ queryKey: ["kitchenItems"] });
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
