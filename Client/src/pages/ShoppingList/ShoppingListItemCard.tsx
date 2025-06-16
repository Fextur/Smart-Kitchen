import { FC, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ShoppingListItem, SizeUnit } from "@/types";
import { CircleCheck, Trash2 } from "lucide-react";
import { AmountEditDialog } from "@/components/KitchenItemCard/AmountEditDialog";
import { DeleteConfirmDialog } from "@/components/KitchenItemCard/DeleteConfirmDialog";
import { useLongPress } from "@/hooks/useLongPress";

interface ShoppingListItemCardProps {
  item: ShoppingListItem;
  onEdit: (updatedItem: ShoppingListItem) => void;
  onLongPress: () => void;
  onDelete: () => void;
}

export const ShoppingListItemCard: FC<ShoppingListItemCardProps> = ({
  item,
  onEdit,
  onLongPress,
  onDelete,
}) => {
  const [showAmountDialog, setShowAmountDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const longPressHandlers = useLongPress({
    onLongPress: onLongPress,
    onShortPress: () => setShowAmountDialog(true),
    longPressDuration: 500,
    movementThreshold: 10,
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteDialog(false);
    onDelete();
  };

  const handleAmountEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowAmountDialog(true);
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
          border: "1px solid",
          direction: "rtl",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 60,
          borderRadius: "50px",
          transition: "all 0.2s",
          cursor: "pointer",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
        {...longPressHandlers}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          {item.isChecked && (
            <CircleCheck
              size={20}
              fill="#E49A61"
              style={{ paddingLeft: "10px" }}
            />
          )}
          <Box
            onClick={handleAmountEditClick}
            sx={{
              minWidth: 50,
              maxWidth: 50,
              cursor: "pointer",
              pr: 0.5,
              pl: 0.5,
              borderRadius: 1,
              bgcolor: "transparent",
              border: "1px dashed",
              borderColor: "#E49A61",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: "rgba(228, 154, 97, 0.1)",
                boxShadow: "0 2px 8px rgba(228, 154, 97, 0.2)",
                transform: "translateY(-1px)",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 500, color: "text.primary" }}
            >
              {`${item.size} ${
                item.measureUnit === SizeUnit.UNIT ? "x" : item.measureUnit
              }`}
            </Typography>
          </Box>
          <Box sx={{ pr: 1.25 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "text.primary" }}
            >
              {item.name}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleDeleteClick}
          size="small"
          sx={{
            color: "#ef4444",
            zIndex: 2,
            "&:hover": {
              bgcolor: "rgba(239, 68, 68, 0.1)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              transform: "translateY(-1px)",
              transition: "all 0.2s ease",
            },
          }}
        >
          <Trash2 size={20} />
        </IconButton>
      </Box>

      <AmountEditDialog
        isOpen={showAmountDialog}
        onClose={() => setShowAmountDialog(false)}
        currentSize={item.size}
        currentUnit={item.measureUnit}
        onSave={(newSize: number, newUnit: SizeUnit) => {
          onEdit({
            ...item,
            size: newSize, // This is the wantedSize for shopping list
            measureUnit: newUnit,
            latestUpdateDate: new Date().toISOString().split("T")[0],
          });
          setShowAmountDialog(false);
        }}
        itemName={item.name}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        itemName={item.name}
      />
    </>
  );
};
