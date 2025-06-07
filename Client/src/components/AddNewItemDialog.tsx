import { FC, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { TextField, Button, Box } from "@mui/material";
import { SizeUnit, KitchenItem } from "@/types";
import { Dialog } from "@/components/Dialog";
import { QuantityInput } from "@/components/KitchenItemCard/QuantityInput";

interface AddNewItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<KitchenItem, "id" | "latestUpdateDate">) => void;
  showExperationDate?: boolean;
}

export const AddNewItemDialog: FC<AddNewItemDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  showExperationDate = true,
}) => {
  const [name, setName] = useState("");
  const [size, setSize] = useState<number>(1);
  const [unit, setUnit] = useState<SizeUnit>(SizeUnit.UNIT);
  const [expirationDate, setExpirationDate] = useState("");

  // Clear form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setSize(1);
      setUnit(SizeUnit.UNIT);
      setExpirationDate("");
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!name.trim() || size <= 0) {
      return;
    }

    const newItem: Omit<KitchenItem, "id" | "latestUpdateDate"> = {
      name: name.trim(),
      size,
      measureUnit: unit,
      expirationDate: expirationDate || undefined,
    };

    onSave(newItem);
    handleClose();
  };

  const handleClose = () => {
    setName("");
    setSize(1);
    setUnit(SizeUnit.UNIT);
    setExpirationDate("");
    onClose();
  };

  const isFormValid = name.trim().length > 0 && size > 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      icon={<Plus size={24} />}
      color="#E49A61"
      title="הוסף פריט חדש"
    >
      <Box sx={{ direction: "rtl" }}>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="שם המוצר"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder="למשל: חלב, לחם, עגבניות..."
            sx={{
              "& input": {
                fontSize: 16,
                fontWeight: 500,
                p: 1.75,
              },
            }}
          />
        </Box>

        <QuantityInput
          size={size}
          setSize={setSize}
          unit={unit}
          setUnit={setUnit}
        />

        {showExperationDate && (
          <Box sx={{ mb: 3 }}>
            <TextField
              label="תאריך תפוגה (אופציונלי)"
              type="date"
              value={expirationDate}
              onChange={(e) => setExpirationDate(e.target.value)}
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              sx={{
                "& input": {
                  fontSize: 16,
                  fontWeight: 500,
                  p: 1.75,
                },
              }}
            />
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!isFormValid}
            sx={{
              flex: 1,
              py: 1.5,
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            הוסף
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};
