import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KitchenItem, ShoppingListItem } from "@/types";
import { API_ROUTES } from "@/axios/apiRoutes";
import api from "@/axios/axios";
import { useKitchen } from "./useKitchen";

export const useShoppingListItems = () => {
  const queryClient = useQueryClient();
  const { kitchen } = useKitchen();

  const fetchShoppingListItems = async () => {
    try {
      if (kitchen?.id) {
        const { data } = await api.get<ShoppingListItem[]>(
          `${API_ROUTES.products}/by-shopping-list/${kitchen.id}`
        );

        return data;
      }
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const createShoppingListItem = async (items: ShoppingListItem[]) => {
    try {
      if (kitchen?.id) {
        const itemsWithoutIds = items.map(({ id, ...rest }) => rest);

        const { data } = await api.post<ShoppingListItem[]>(
          `${API_ROUTES.shoppingList}/`,
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
    mutationFn: (items: ShoppingListItem[]) => createShoppingListItem(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingListItems"] });
    },
  });

  const deleteShoppingListItem = async (itemId: ShoppingListItem["id"]) => {
    try {
      await api.delete(`${API_ROUTES.products}/${itemId}`);
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const deleteItemsMutation = useMutation({
    mutationFn: (itemId: ShoppingListItem["id"]) =>
      deleteShoppingListItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingListItems"] });
    },
  });

  const clearShoppingListItems = async () => {
    try {
      if (kitchen?.id) {
        await api.delete(`${API_ROUTES.shoppingList}/${kitchen.id}`);
      }
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const clearItemsMutation = useMutation({
    mutationFn: () => clearShoppingListItems(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingListItems"] });
    },
  });

  const transferIntoShoppingList = async (item: KitchenItem) => {
    try {
      if (kitchen?.id) {
        await api.post(
          `${API_ROUTES.shoppingList}/${kitchen.id}/transfer-to-shopping-list`,
          {
            product: item,
          }
        );
      }
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const transferIntoShoppingListMutation = useMutation({
    mutationFn: (item: KitchenItem) => transferIntoShoppingList(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchenItems"] });

      queryClient.invalidateQueries({ queryKey: ["shoppingListItems"] });
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["shoppingListItems"],
    queryFn: fetchShoppingListItems,
  });

  return {
    items: data || [],
    isLoading,
    createItemsMutation,
    deleteItemsMutation,
    clearItemsMutation,
    transferIntoShoppingListMutation,
  };
};
