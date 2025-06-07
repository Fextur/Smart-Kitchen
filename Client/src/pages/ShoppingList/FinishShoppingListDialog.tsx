import { FC, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { ScanLine, Edit, Check, ScrollText } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Dialog } from "@/components/Dialog";
import { AddProductsDialog } from "@/components/AddProductsDialog/AddProductsDialog";
import { ShoppingListItem, KitchenItem } from "@/types";

interface FinishShoppingListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  shoppingListItems: ShoppingListItem[];
}

export const FinishShoppingListDialog: FC<FinishShoppingListDialogProps> = ({
  isOpen,
  onClose,
  onFinish,
  shoppingListItems,
}) => {
  const navigate = useNavigate();
  const [isAddProductsOpen, setIsAddProductsOpen] = useState(false);

  const handleAddProducts = () => {
    setIsAddProductsOpen(true);
  };

  const handleManualEntry = () => {
    onClose();
    onFinish();
    navigate({
      to: "/home",
    });
  };

  const handleAutoAddToKitchen = () => {
    // Convert shopping list items to kitchen items
    const kitchenItems: KitchenItem[] = shoppingListItems.map(
      (item, index) => ({
        id: `shopping-${index}-${Date.now()}`,
        name: item.name,
        size: item.size,
        measureUnit: item.measureUnit,
        latestUpdateDate: new Date().toISOString().split("T")[0],
      })
    );

    onClose();
    onFinish(); // This will clear the shopping list

    // Navigate to add products page with the shopping list items
    (navigate as any)({
      to: "/add-products",
      state: {
        items: kitchenItems,
        isFromScan: false,
      },
    });
  };

  const handleClose = () => {
    setIsAddProductsOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog
        isOpen={isOpen && !isAddProductsOpen}
        onClose={onClose}
        icon={<Check size={24} />}
        color="#E49A61"
        title="מה תרצה לעשות עכשיו?"
      >
        <Box sx={{ direction: "rtl" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                py: 2,
                borderColor: "primary.main",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                "&:hover": {
                  bgcolor: "primary.light",
                  color: "white",
                  borderColor: "primary.main",
                },
              }}
              onClick={handleAddProducts}
            >
              <ScanLine color="white" size={20} />
              <Typography variant="body1" color="white">
                הוסף למטבח מקבלה או ידנית
              </Typography>
            </Button>
            <Button
              variant="contained"
              fullWidth
              sx={{
                py: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                bgcolor: "primary.main",
                "&:hover": {
                  bgcolor: "primary.dark",
                },
              }}
              onClick={handleAutoAddToKitchen}
            >
              <ScrollText size={20} />
              <Typography variant="body1" color="white">
                הוסף את כל הרשימה למטבח{" "}
              </Typography>
            </Button>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              onClick={handleManualEntry}
              sx={{
                py: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Edit size={20} />
              <Typography variant="body1">אעדכן את המטבח אחר כך</Typography>
            </Button>
          </Box>
        </Box>
      </Dialog>

      <AddProductsDialog
        isOpen={isAddProductsOpen}
        onClose={handleClose}
        onFinish={onFinish}
      />
    </>
  );
};
