import { FC, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { ShoppingListItem, SizeUnit } from "@/types";
import { CircleCheck, Trash2 } from "lucide-react";
import { AmountEditDialog } from "@/components/KitchenItemCard/AmountEditDialog";
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

  const longPressHandlers = useLongPress({
    onLongPress: onLongPress,
    onShortPress: () => setShowAmountDialog(true),
    longPressDuration: 500,
    movementThreshold: 10,
  });

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
            onClick={() => setShowAmountDialog(true)}
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
          onClick={onDelete}
          size="small"
          sx={{
            color: "#ef4444",
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
        onSave={(size: number, unit: SizeUnit) => {
          onEdit({
            ...item,
            size,
            measureUnit: unit,
            latestUpdateDate: new Date().toISOString().split("T")[0],
          });
        }}
        itemName={item.name}
      />
    </>
  );
};
