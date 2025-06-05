import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KitchenItem, ShoppingListItem, SizeUnit } from "@/types";
import api from "@/axios/axios";
import { API_ROUTES } from "@/axios/apiRoutes";

export const useShoppingListItems = () => {
  const queryClient = useQueryClient();

  const fetchShoppingListItems = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const stubItems: ShoppingListItem[] = [
        {
          id: "1",
          name: "חרטה",
          size: 1,
          measureUnit: SizeUnit.UNIT,
          latestUpdateDate: "2024-05-20",
          isChecked: false,
        },
        {
          id: "2",
          name: "במבה",
          size: 1,
          measureUnit: SizeUnit.UNIT,
          latestUpdateDate: "2024-05-20",
          isChecked: false,
        },
        {
          id: "3",
          name: "טונה",
          size: 1,
          measureUnit: SizeUnit.LITER,
          latestUpdateDate: "2024-05-15",
          isChecked: true,
        },
        {
          id: "4",
          name: "מלוואח",
          size: 500,
          measureUnit: SizeUnit.GRAM,
          latestUpdateDate: "2024-05-20",
          isChecked: false,
        },
      ];

      return stubItems;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const updateShoppingListItem = async (items: ShoppingListItem[]) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return items;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const updateItemsMutation = useMutation({
    mutationFn: (items: ShoppingListItem[]) => updateShoppingListItem(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoppingListItems"] });
    },
  });

  const addItemsToShoppingList = async (
    inventoryId: string,
    items: KitchenItem[]
  ) => {
    try {
      const { data } = await api.post(API_ROUTES.shoppingList, {
        inventoryId,
        products: items,
      });
      return data;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const addItemsMutation = useMutation({
    mutationFn: ({
      inventoryId,
      items,
    }: {
      inventoryId: string;
      items: KitchenItem[];
    }) => addItemsToShoppingList(inventoryId, items),
  });

  const deleteShoppingListItem = async (itemId: ShoppingListItem["id"]) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return itemId;
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      return true;
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

  const { data, isLoading } = useQuery({
    queryKey: ["shoppingListItems"],
    queryFn: fetchShoppingListItems,
  });

  return {
    items: data || [],
    isLoading,
    updateItemsMutation,
    deleteItemsMutation,
    clearItemsMutation,
    addItemsMutation,
  };
};
