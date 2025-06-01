import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KitchenItem, SizeUnit } from "@/types";
import { useMemo } from "react";
import { isExpiringSoon } from "@/utils/dateUtils";

export const useKitchenItems = () => {
  const queryClient = useQueryClient();

  const fetchKitchenItems = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const stubItems: KitchenItem[] = [
        {
          id: "1",
          name: "קולה",
          size: 1,
          measureUnit: SizeUnit.UNIT,
          expirationDate: "2024-06-15",
          latestUpdateDate: "2024-05-20",
        },
        {
          id: "2",
          name: "במבה",
          size: 0,
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
          size: 0,
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

  const updateKitchenItem = async (items: KitchenItem[]) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return items;
    } catch (error) {
      console.error(error);
      throw new Error("An unexpected error occurred");
    }
  };

  const updateItemsMutation = useMutation({
    mutationFn: (items: KitchenItem[]) => updateKitchenItem(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchenItems"] });
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
    updateItemsMutation,
    categorizedItems,
  };
};
