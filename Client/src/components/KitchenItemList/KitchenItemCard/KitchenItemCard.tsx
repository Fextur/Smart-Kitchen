import { FC, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Trash2 } from "lucide-react";
import { KitchenItem, SizeUnit } from "@/types";
import { DateEditDialog } from "@/components/KitchenItemList/KitchenItemCard/DateEditDialog";
import { formatDate, isExpiringSoon } from "@/utils/dateUtils";
import { DeleteConfirmDialog } from "@/components/KitchenItemList/KitchenItemCard/DeleteConfirmDialog";
import { AmountEditDialog } from "@/components/KitchenItemList/KitchenItemCard/AmountEditDialog";

interface KitchenItemCardProps {
  item: KitchenItem;
  onEdit?: (updatedItem: KitchenItem) => void;
  isEditing?: boolean;
}

export const KitchenItemCard: FC<KitchenItemCardProps> = ({
  item,
  onEdit,
  isEditing = false,
}) => {
  const [showAmountDialog, setShowAmountDialog] = useState(false);
  const [showDateDialog, setShowDateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
  const handleDateSave = (expirationDate: string | null) => {
    if (onEdit) {
      onEdit({
        ...item,
        expirationDate: expirationDate, // Always include this field, even if null
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
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <Box
            onClick={isEditing ? () => setShowAmountDialog(true) : undefined}
            sx={{
              minWidth: 50,
              maxWidth: 50,
              cursor: isEditing ? "pointer" : "default",
              pr: isEditing ? 0.5 : 0,
              pl: isEditing ? 0.5 : 0,
              borderRadius: 1,
              bgcolor: "transparent",
              border: isEditing ? "1px dashed" : "none",
              borderColor: "primary.main",
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

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "row",
            gap: 1.5,
          }}
        >
          {((item.expirationDate !== undefined &&
            item.expirationDate !== null) ||
            isEditing) && (
            <Box
              onClick={isEditing ? () => setShowDateDialog(true) : undefined}
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                cursor: isEditing ? "pointer" : "default",
                p: isEditing ? 0.5 : 0,
                borderRadius: 1,
                bgcolor: "transparent",
                border: isEditing ? "1px dashed" : "none",
                borderColor: "primary.main",
                transition: "all 0.2s",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color:
                    item.expirationDate && isExpiringSoon(item.expirationDate)
                      ? "error.main"
                      : "text.secondary",
                }}
              >
                {`תאריך תפוגה${item.expirationDate ? ":" : ""}`}
              </Typography>
              {item.expirationDate && (
                <Typography variant="caption">
                  {formatDate(item.expirationDate)}
                </Typography>
              )}
            </Box>
          )}

          {!isEditing ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                עודכן לאחרונה:
              </Typography>
              <Typography variant="caption">
                {formatDate(item.latestUpdateDate ?? "")}
              </Typography>
            </Box>
          ) : (
            <IconButton
              onClick={() => setShowDeleteDialog(true)}
              size="small"
              sx={{
                color: "error.main",
                "&:hover": {
                  bgcolor: "error.light",
                  color: "white",
                },
              }}
            >
              <Trash2 size={16} />
            </IconButton>
          )}
        </Box>
      </Box>

      <AmountEditDialog
        isOpen={showAmountDialog}
        onClose={() => setShowAmountDialog(false)}
        currentSize={item.size}
        currentUnit={item.measureUnit}
        onSave={handleAmountSave}
        itemName={item.name}
      />

      <DateEditDialog
        isOpen={showDateDialog}
        onClose={() => setShowDateDialog(false)}
        currentDate={item.expirationDate ?? ""}
        onSave={handleDateSave}
      />

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => handleAmountSave(0, item.measureUnit)}
        itemName={item.name}
      />
    </>
  );
};
