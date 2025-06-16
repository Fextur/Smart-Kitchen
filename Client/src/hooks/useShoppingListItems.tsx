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
      return [];
    } catch (error) {
      console.error("Error fetching shopping list items:", error);
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
      return [];
    } catch (error) {
      console.error("Error creating shopping list items:", error);
      throw new Error("An unexpected error occurred");
    }
  };

  const createItemsMutation = useMutation({
    mutationFn: (items: ShoppingListItem[]) => createShoppingListItem(items),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shoppingListItems", kitchen?.id],
      });
    },
  });

  // NEW: Update shopping list item using the shopping list endpoint
  const updateShoppingListItem = async (item: ShoppingListItem) => {
    try {
      if (!item.id) {
        throw new Error("Item ID is required for update");
      }

      const { data } = await api.patch<ShoppingListItem>(
        `${API_ROUTES.shoppingList}/product/${item.id}`,
        {
          wantedSize: item.size, // Frontend 'size' maps to backend 'wantedSize'
          measureUnit: item.measureUnit,
          isChecked: item.isChecked,
          name: item.name,
        }
      );

      return data;
    } catch (error) {
      console.error("Error updating shopping list item:", error);
      throw new Error("An unexpected error occurred");
    }
  };

  const updateItemMutation = useMutation({
    mutationFn: (item: ShoppingListItem) => updateShoppingListItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shoppingListItems", kitchen?.id],
      });
    },
  });

  const deleteShoppingListItem = async (itemId: ShoppingListItem["id"]) => {
    try {
      await api.delete(`${API_ROUTES.shoppingList}/product/${itemId}`);
    } catch (error) {
      console.error("Error deleting shopping list item:", error);
      throw new Error("An unexpected error occurred");
    }
  };

  const deleteItemsMutation = useMutation({
    mutationFn: (itemId: ShoppingListItem["id"]) =>
      deleteShoppingListItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shoppingListItems", kitchen?.id],
      });
    },
  });

  const clearShoppingListItems = async () => {
    try {
      if (kitchen?.id) {
        await api.delete(`${API_ROUTES.shoppingList}/${kitchen.id}`);
      }
    } catch (error) {
      console.error("Error clearing shopping list:", error);
      throw new Error("An unexpected error occurred");
    }
  };

  const clearItemsMutation = useMutation({
    mutationFn: () => clearShoppingListItems(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shoppingListItems", kitchen?.id],
      });
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
      console.error("Error transferring to shopping list:", error);
      throw new Error("An unexpected error occurred");
    }
  };

  const transferIntoShoppingListMutation = useMutation({
    mutationFn: (item: KitchenItem) => transferIntoShoppingList(item),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kitchenItems", kitchen?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["shoppingListItems", kitchen?.id],
      });
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["shoppingListItems", kitchen?.id],
    queryFn: fetchShoppingListItems,
    enabled: !!kitchen?.id,
  });

  return {
    items: data || [],
    isLoading,
    createItemsMutation,
    updateItemMutation, // NEW: Dedicated shopping list update
    deleteItemsMutation,
    clearItemsMutation,
    transferIntoShoppingListMutation,
  };
};
