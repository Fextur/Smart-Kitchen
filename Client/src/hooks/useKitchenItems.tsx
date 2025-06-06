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

  const updateKitchenItem = async (items: KitchenItem[]) => {
    try {
      const { data } = await api.post<KitchenItem[]>(
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
      (item) => item.expirationDate && isExpiringSoon(item.expirationDate)
    );

    const empty = data
      .filter((item) => item.size === 0)
      .map((item) => ({ ...item, expirationDate: undefined } as KitchenItem));

    const inKitchen = data.filter((item) => item.size !== 0);

    return { expiringSoon, empty, inKitchen };
  }, [data]);

  return {
    items: data || [],
    isLoading,
    createItemsMutation,
    updateItemsMutation,
    categorizedItems,
  };
};
