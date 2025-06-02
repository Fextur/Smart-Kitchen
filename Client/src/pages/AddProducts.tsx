import { FC, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { KitchenItem } from "@/types";
import { KitchenItemList } from "@/components/KitchenItemList/KitchenItemList";
import { useKitchenItems } from "@/hooks/useKitchenItems";
import ConfirmFooter from "@/components/ConfirmFooter";
import { KitchenItemCard } from "@/components/KitchenItemList/KitchenItemCard/KitchenItemCard";

interface AddProductsLocationState {
  items?: KitchenItem[];
  isFromScan?: boolean;
}

const AddProducts: FC = () => {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { createItemsMutation } = useKitchenItems();

  const locationState = routerState.location.state as
    | AddProductsLocationState
    | undefined;
  const initialItems = Array.isArray(locationState?.items)
    ? locationState.items
    : [];
  const isFromScan = Boolean(locationState?.isFromScan);

  const [items, setItems] = useState<KitchenItem[]>(initialItems);

  const handleUpdateItem = (updatedItem: KitchenItem) => {
    setItems((prevItems) =>
      updatedItem.size === 0
        ? prevItems.filter((item) => item.id !== updatedItem.id)
        : prevItems.map((item) =>
            item.id === updatedItem.id ? updatedItem : item
          )
    );
  };

  const handleAddNewItem = (
    newItem: Omit<KitchenItem, "id" | "latestUpdateDate">
  ) => {
    const item: KitchenItem = {
      ...newItem,
      id: `temp-${Date.now()}`,
      latestUpdateDate: new Date().toISOString().split("T")[0],
    };
    setItems((prevItems) => [...prevItems, item]);
  };

  const handleAccept = () => {
    createItemsMutation.mutate(items, {
      onSuccess: () => {
        navigate({ to: "/" });
      },
      onError: (error) => {
        console.error("Failed to save items:", error);
      },
    });
  };

  const handleCancel = () => {
    navigate({ to: "/" });
  };

  return (
    <Box
      sx={{
        height: "75vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "transparent",
        pb: "10vh",
      }}
    >
      <Box
        sx={{
          p: 2,
          // bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "grey.100",
          direction: "rtl",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h2" sx={{ fontWeight: 600 }}>
            הוסף מוצרים
          </Typography>
        </Box>

        {isFromScan && (
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mt: 1,
            }}
          >
            נסרקו {items.length} פריטים מהקבלה
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 2,
          direction: "rtl",
        }}
      >
        <KitchenItemList
          itemsCount={items.length}
          title="פריטים להוספה"
          isEditing
          onAddNewItem={handleAddNewItem}
          maxHeight="100%"
          renderRow={(itemIndex, isEditing) => (
            <KitchenItemCard
              item={items[itemIndex]}
              onEdit={handleUpdateItem}
              isEditing={isEditing}
            />
          )}
        />
      </Box>
      <ConfirmFooter
        onAccept={handleAccept}
        onCancel={handleCancel}
        isLoading={false}
        isDisabled={items.length === 0}
      />
    </Box>
  );
};

export default AddProducts;
