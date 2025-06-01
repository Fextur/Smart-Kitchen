import { FC, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { KitchenItem, SizeUnit } from "@/types";
import { Plus } from "lucide-react";
import { AmountEditDialog } from "@/components/KitchenItemList/KitchenItemCard/AmountEditDialog";

interface SuggestedShoppingListItemCardProps {
  item: KitchenItem;
  onEdit: (updatedItem: KitchenItem) => void;
}

export const SuggestedShoppingListItemCard: FC<
  SuggestedShoppingListItemCardProps
> = ({ item, onEdit }) => {
  const [showAmountDialog, setShowAmountDialog] = useState(false);

  const handleAmountSave = (size: number, unit: SizeUnit) => {
    if (onEdit) {
      onEdit({
        ...item,
        size,
        measureUnit: unit,
        latestUpdateDate: new Date().toISOString().split("T")[0],
      });
    }
  };
  return (
    <>
      <Box
        sx={{
          bgcolor: "background.paper",
          my: 1.5,
          px: 2,
          borderBottom: "1px solid",
          borderColor: "grey.100",
          direction: "rtl",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 60,
          borderRadius: "50px",
        }}
        onClick={() => setShowAmountDialog(true)}
      >
        <Box sx={{ pr: 1.25 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: "text.primary" }}
          >
            {item.name}
          </Typography>
        </Box>
        <IconButton
          onClick={() => {}}
          size="small"
          sx={{
            color: "error.main",
            "&:hover": {
              bgcolor: "error.light",
              color: "white",
            },
          }}
        >
          <Plus size={20} />
        </IconButton>
      </Box>
      <AmountEditDialog
        isOpen={showAmountDialog}
        onClose={() => setShowAmountDialog(false)}
        currentSize={item.size}
        currentUnit={item.measureUnit}
        onSave={handleAmountSave}
        itemName={item.name}
      />
    </>
  );
};
