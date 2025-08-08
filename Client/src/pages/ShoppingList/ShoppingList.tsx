import { FC, useCallback, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useKitchenItems } from "@/hooks/useKitchenItems";
import ConfirmFooter from "@/components/ConfirmFooter";
import { useRouter } from "@tanstack/react-router";
import { ItemList } from "@/components/ItemList";
import { SuggestedShoppingListItemCard } from "@/pages/ShoppingList/SuggestedShoppingListItemCard";
import { ShoppingListItem } from "@/types";
import { useShoppingListItems } from "@/hooks/useShoppingListItems";
import { ShoppingListItemCard } from "@/pages/ShoppingList/ShoppingListItemCard";
import { FinishShoppingListDialog } from "@/pages/ShoppingList/FinishShoppingListDialog";

const ShoppingList: FC = () => {
  const { categorizedItems, isLoading } = useKitchenItems();

  const {
    items: shoppingListItems,
    isLoading: isShoppingListLoading,
    createItemsMutation: createShoppingItemsMutation,
    updateItemMutation: updateShoppingItemMutation, // Use dedicated shopping list update
    deleteItemsMutation: deleteShoppingItemsMutation,
    clearItemsMutation: clearShoppingListMutation,
    transferIntoShoppingListMutation,
  } = useShoppingListItems();
  const router = useRouter();
  const [showFinishDialog, setShowFinishDialog] = useState(false);

  const handleEditItem = useCallback(
    (item: ShoppingListItem) => {
      updateShoppingItemMutation.mutate(item);
    },
    [updateShoppingItemMutation]
  );

  const emptyKitchenItemsMissingFromShoppingList = useMemo(
    () =>
      categorizedItems?.empty.filter(
        (item) =>
          !shoppingListItems.some((shoppingItem) => shoppingItem.id === item.id)
      ),
    [categorizedItems, shoppingListItems]
  );

  if (isLoading || isShoppingListLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Box sx={{ textAlign: "center", direction: "rtl" }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            טוען פריטים...
          </Typography>
        </Box>
      </Box>
    );
  }

  const handleAddNewItem = (
    newItem: Omit<ShoppingListItem, "id" | "latestUpdateDate" | "isChecked">
  ) => {
    const item: ShoppingListItem = {
      ...newItem,
      id: `temp-${Date.now()}`,
      latestUpdateDate: new Date().toISOString().split("T")[0],
      isChecked: false,
    };

    createShoppingItemsMutation.mutate([item]);
  };

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "75vh",
          bgcolor: "transparent",
          direction: "rtl",
          position: "relative",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            bgcolor: "background.default",
          }}
        >
          <Typography variant="h1">רשימת קניות</Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            px: 2,
          }}
        >
          <Box sx={{ mb: 2 }}>
            <ItemList
              itemsCount={shoppingListItems.length}
              title="ברשימה"
              onAddNewItem={(item) => {
                handleAddNewItem(item);
              }}
              showExperationDateOnNewItem={false}
              renderRow={(itemIndex) => (
                <ShoppingListItemCard
                  item={shoppingListItems[itemIndex]}
                  onEdit={handleEditItem}
                  onDelete={() =>
                    deleteShoppingItemsMutation.mutate(
                      shoppingListItems[itemIndex].id
                    )
                  }
                  onLongPress={() => {
                    updateShoppingItemMutation.mutate({
                      ...shoppingListItems[itemIndex],
                      isChecked: !shoppingListItems[itemIndex].isChecked,
                    });
                  }}
                />
              )}
            />
          </Box>
          <Box sx={{ mb: 2 }}>
            <ItemList
              itemsCount={
                !emptyKitchenItemsMissingFromShoppingList
                  ? 0
                  : emptyKitchenItemsMissingFromShoppingList.length
              }
              title="נגמרו במטבח"
              renderRow={(itemIndex) => (
                <SuggestedShoppingListItemCard
                  item={emptyKitchenItemsMissingFromShoppingList![itemIndex]}
                  onEdit={(item) =>
                    transferIntoShoppingListMutation.mutate(item)
                  }
                />
              )}
            />
          </Box>
        </Box>
      </Box>

      <ConfirmFooter
        onAccept={() => {
          setShowFinishDialog(true);
        }}
        onBack={() => router.history.go(-1)}
      />

      <FinishShoppingListDialog
        isOpen={showFinishDialog}
        onClose={() => {
          setShowFinishDialog(false);
        }}
        onFinish={() => {
          clearShoppingListMutation.mutate();
        }}
        shoppingListItems={shoppingListItems}
      />
    </div>
  );
};

export default ShoppingList;
