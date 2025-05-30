import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KitchenItem, SizeUnit } from "../types";

export const useKitchenItems = () => {
  const queryClient = useQueryClient();

  const fetchKitchenItems = async () => {
    try {
      // TODO: Replace with actual API call
      // const { data } = await api.get<KitchenItem[]>(API_ROUTES.kitchenItems);
      // return data;

      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 800));

      const stubItems: KitchenItem[] = [
        {
          id: "1",
          name: "במבה",
          size: 1,
          measureUnit: SizeUnit.UNIT,
          expirationDate: "2024-06-15",
          latestUpdateDate: "2024-05-20",
        },
        {
          id: "2",
          name: "קולה",
          size: 2,
          measureUnit: SizeUnit.UNIT,
          expirationDate: "2024-07-01",
          latestUpdateDate: "2024-05-20",
        },
        {
          id: "3",
          name: "חלב",
          size: 1,
          measureUnit: SizeUnit.LITER,
          expirationDate: "2024-06-01",
          latestUpdateDate: "2024-05-15",
        },
        {
          id: "4",
          name: "חזה עוף",
          size: 500,
          measureUnit: SizeUnit.GRAM,
          expirationDate: "2024-06-10",
          latestUpdateDate: "2024-05-20",
        },
        {
          id: "5",
          name: "לחם שלם",
          size: 1,
          measureUnit: SizeUnit.UNIT,
          expirationDate: "2024-06-05",
          latestUpdateDate: "2024-05-20",
        },
        {
          id: "6",
          name: "גבינה לבנה",
          size: 250,
          measureUnit: SizeUnit.GRAM,
          expirationDate: "2024-06-20",
          latestUpdateDate: "2024-05-18",
        },
        {
          id: "7",
          name: "עגבניות",
          size: 1,
          measureUnit: SizeUnit.KILOGRAM,
          expirationDate: "2024-06-08",
          latestUpdateDate: "2024-05-22",
        },
        {
          id: "8",
          name: "בצל",
          size: 2,
          measureUnit: SizeUnit.KILOGRAM,
          expirationDate: "2024-07-15",
          latestUpdateDate: "2024-05-19",
        },
        {
          id: "9",
          name: "אורז",
          size: 1,
          measureUnit: SizeUnit.KILOGRAM,
          expirationDate: "2025-01-01",
          latestUpdateDate: "2024-05-10",
        },
        {
          id: "10",
          name: "שמן זית",
          size: 500,
          measureUnit: SizeUnit.MILLILITER,
          expirationDate: "2024-12-31",
          latestUpdateDate: "2024-05-05",
        },
      ];

      return stubItems;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const updateKitchenItem = async (item: KitchenItem) => {
    try {
      // TODO: Replace with actual API call
      // const { data } = await api.put<KitchenItem>(`${API_ROUTES.kitchenItems}/${item.id}`, item);
      // return data;

      // Mock update
      await new Promise((resolve) => setTimeout(resolve, 500));
      return item;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const updateItemMutation = useMutation({
    mutationFn: (item: KitchenItem) => updateKitchenItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchenItems"] });
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["kitchenItems"],
    queryFn: fetchKitchenItems,
  });

  return {
    items: data || [],
    isLoading,
    updateItemMutation,
  };
};
