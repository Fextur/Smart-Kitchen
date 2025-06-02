import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { KitchenItem, SizeUnit } from "@/types";
import api from "@/axios/axios";

interface ScanReceiptResponse {
  items: KitchenItem[];
}

interface ParsedProduct {
  name: string;
  size: number;
  measureUnit: SizeUnit;
  expirationDate: Date | null;
}

const convertParsedProductToKitchenItem = (
  product: ParsedProduct,
  index: number
): KitchenItem => {
  let measureUnit: SizeUnit;
  switch (product.measureUnit.toLowerCase()) {
    case "גרם":
    case "gram":
      measureUnit = SizeUnit.GRAM;
      break;
    case "קילוגרם":
    case "kilogram":
    case "kg":
      measureUnit = SizeUnit.KILOGRAM;
      break;
    case "ליטר":
    case "liter":
    case "l":
      measureUnit = SizeUnit.LITER;
      break;
    case "מיליליטר":
    case "milliliter":
    case "ml":
      measureUnit = SizeUnit.MILLILITER;
      break;
    default:
      measureUnit = SizeUnit.UNIT;
  }

  return {
    id: `scanned-${index}-${Date.now()}`,
    name: product.name,
    size: product.size,
    measureUnit,
    expirationDate: product.expirationDate
      ? product.expirationDate.toISOString().split("T")[0]
      : undefined,
    latestUpdateDate: new Date().toISOString().split("T")[0],
  };
};

const scanReceipt = async (file: File): Promise<ScanReceiptResponse> => {
  const formData = new FormData();
  formData.append("receipt", file);

  try {
    const response = await api.post<ParsedProduct[]>(
      `${import.meta.env.VITE_API_URL}/receipt-scanner/scan`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const items = response.data.map((product, index) =>
      convertParsedProductToKitchenItem(product, index)
    );

    return { items };
  } catch (error) {
    console.error("Receipt scanning failed:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400) {
        throw new Error("תמונה לא תקינה או לא ניתן לזהות קבלה");
      } else if (error.response?.status === 500) {
        throw new Error("שגיאה בשרת, נסה שוב מאוחר יותר");
      }
    }

    throw new Error("שגיאה בסריקת הקבלה");
  }
};

export const useReceiptScanner = () => {
  const scanReceiptMutation = useMutation({
    mutationFn: scanReceipt,
    onError: (error) => {
      console.error("Receipt scanning error:", error);
    },
  });

  return {
    scanReceiptMutation,
    isScanning: scanReceiptMutation.isPending,
    error: scanReceiptMutation.error,
  };
};
