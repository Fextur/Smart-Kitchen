import { FC, useState } from "react";
import { Edit3 } from "lucide-react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  Box,
} from "@mui/material";
import { SizeUnit } from "@/types";
import { Dialog } from "@/components/Dialog";
import { DeleteConfirmDialog } from "@/components/KitchenItemList/KitchenItemCard/DeleteConfirmDialog";

interface AmountEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSize: number;
  currentUnit: SizeUnit;
  onSave: (size: number, unit: SizeUnit) => void;
  onDelete?: () => void;
  itemName?: string;
}

export const AmountEditDialog: FC<AmountEditDialogProps> = ({
  isOpen,
  onClose,
  currentSize,
  currentUnit,
  onSave,
  onDelete,
  itemName,
}) => {
  const [size, setSize] = useState(currentSize);
  const [unit, setUnit] = useState(currentUnit);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    if (size === 0 && onDelete) {
      setShowDeleteConfirm(true);
      return;
    }

    onSave(size, unit);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      onSave(0, unit);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleCancel = () => {
    setSize(currentSize);
    setUnit(currentUnit);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <>
      <Dialog
        isOpen={isOpen && !showDeleteConfirm}
        onClose={handleCancel}
        icon={<Edit3 size={24} />}
        color="#E49A61"
        title="עדכן את הכמות"
      >
        <Box sx={{ direction: "rtl" }}>
          <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
            <TextField
              type="number"
              value={size}
              onChange={(e) => setSize(parseFloat(e.target.value) || 0)}
              inputProps={{
                min: 0,
                step: 0.1,
              }}
              slotProps={{
                htmlInput: {
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  step: "0.1",
                },
              }}
              sx={{
                flex: 1,
                "& input": {
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 500,
                  p: 1.75,
                },
              }}
              placeholder="0.5"
            />

            <FormControl sx={{ minWidth: 120 }}>
              <Select
                value={unit}
                onChange={(e) => setUnit(e.target.value as SizeUnit)}
                sx={{
                  "& .MuiSelect-select": {
                    textAlign: "right",
                    fontSize: 16,
                    fontWeight: 500,
                    p: 1.75,
                  },
                }}
              >
                <MenuItem value={SizeUnit.UNIT}>יח׳</MenuItem>
                <MenuItem value={SizeUnit.GRAM}>גרם</MenuItem>
                <MenuItem value={SizeUnit.KILOGRAM}>קילוגרם</MenuItem>
                <MenuItem value={SizeUnit.LITER}>ליטר</MenuItem>
                <MenuItem value={SizeUnit.MILLILITER}>מיליליטר</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              py: 1.75,
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            עדכן
          </Button>
        </Box>
      </Dialog>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        itemName={itemName}
      />
    </>
  );
};
