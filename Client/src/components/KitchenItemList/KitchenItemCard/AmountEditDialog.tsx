import { FC, useState } from "react";
import { Edit3 } from "lucide-react";
import { Button, Box } from "@mui/material";
import { SizeUnit } from "@/types";
import { Dialog } from "@/components/Dialog";
import { DeleteConfirmDialog } from "@/components/KitchenItemList/KitchenItemCard/DeleteConfirmDialog";
import { QuantityInput } from "@/components/KitchenItemList/KitchenItemCard/QuantityInput";

interface AmountEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSize: number;
  currentUnit: SizeUnit;
  onSave: (size: number, unit: SizeUnit) => void;
  itemName?: string;
}

export const AmountEditDialog: FC<AmountEditDialogProps> = ({
  isOpen,
  onClose,
  currentSize,
  currentUnit,
  onSave,
  itemName,
}) => {
  const [size, setSize] = useState(currentSize);
  const [unit, setUnit] = useState(currentUnit);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    if (size === 0) {
      setShowDeleteConfirm(true);
      return;
    }

    onSave(size, unit);
    onClose();
  };

  const handleDelete = () => {
    onSave(0, unit);
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
          <QuantityInput
            size={size}
            setSize={setSize}
            unit={unit}
            setUnit={setUnit}
          />

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
