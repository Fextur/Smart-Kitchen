import { FC, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Trash2 } from "lucide-react";
import { KitchenItem, SizeUnit } from "@/types";
import { DateEditDialog } from "@/components/KitchenItemCard/DateEditDialog";
import { formatDate, isExpiringSoon } from "@/utils/dateUtils";
import { DeleteConfirmDialog } from "@/components/KitchenItemCard/DeleteConfirmDialog";
import { AmountEditDialog } from "@/components/KitchenItemCard/AmountEditDialog";

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
        expirationDate: expirationDate,
        latestUpdateDate: new Date().toISOString().split("T")[0],
      });
    }
  };

  const handleDelete = () => {
    handleAmountSave(0, item.measureUnit);
    setShowDeleteDialog(false);
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
              borderColor: "#E49A61",
              transition: "all 0.2s ease",
              ...(isEditing && {
                "&:hover": {
                  bgcolor: "rgba(228, 154, 97, 0.1)",
                  boxShadow: "0 2px 8px rgba(228, 154, 97, 0.2)",
                  transform: "translateY(-1px)",
                },
              }),
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
                borderColor: "#E49A61",
                transition: "all 0.2s ease",
                ...(isEditing && {
                  "&:hover": {
                    bgcolor: "rgba(228, 154, 97, 0.1)",
                    boxShadow: "0 2px 8px rgba(228, 154, 97, 0.2)",
                    transform: "translateY(-1px)",
                  },
                }),
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
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
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
        onConfirm={handleDelete}
        itemName={item.name}
      />
    </>
  );
};
