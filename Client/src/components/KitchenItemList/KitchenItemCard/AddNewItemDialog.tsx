import { FC, useState } from "react";
import { Plus } from "lucide-react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  Button,
  Box,
  InputLabel,
} from "@mui/material";
import { SizeUnit, KitchenItem } from "@/types";
import { Dialog } from "@/components/Dialog";

interface AddNewItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<KitchenItem, "id" | "latestUpdateDate">) => void;
}

export const AddNewItemDialog: FC<AddNewItemDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [size, setSize] = useState<number>(1);
  const [unit, setUnit] = useState<SizeUnit>(SizeUnit.UNIT);
  const [expirationDate, setExpirationDate] = useState("");

  const handleSave = () => {
    if (!name.trim()) {
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

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      icon={<Plus size={24} />}
      color="#f97316"
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

        <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
          <TextField
            label="כמות"
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
                fontSize: 16,
                fontWeight: 500,
                p: 1.75,
              },
            }}
            placeholder="1"
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>יחידה</InputLabel>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value as SizeUnit)}
              label="יחידה"
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

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!name.trim()}
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
