import { FC } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  Box,
  InputLabel,
} from "@mui/material";
import { KitchenItem, SizeUnit } from "@/types";
import { MathUtils } from "@/utils/mathUtils";

interface QuantityInputProps {
  size: KitchenItem["size"];
  setSize: (size: KitchenItem["size"]) => void;
  unit: KitchenItem["measureUnit"];
  setUnit: (unit: KitchenItem["measureUnit"]) => void;
}

const sizeUnitsArray = Object.keys(SizeUnit).map((key) => ({
  value: SizeUnit[key as keyof typeof SizeUnit],
  label: key,
}));

export const QuantityInput: FC<QuantityInputProps> = ({
  size,
  setSize,
  unit,
  setUnit,
}) => {
  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
      <TextField
        label="כמות"
        type="number"
        value={size}
        onChange={(e) =>
          setSize(MathUtils.smartRound(parseFloat(e.target.value) || 0))
        }
        slotProps={{
          htmlInput: {
            inputMode: "numeric",
            pattern: "[0-9]*",
            step: "0.1",
            min: "0",
            dir: "ltr",
          },
        }}
        sx={{
          flex: 1,
          "& input": {
            textAlign: "center",
            fontSize: 16,
            fontWeight: 500,
            p: 1.75,
            direction: "ltr",
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
          {sizeUnitsArray.map((unit) => (
            <MenuItem value={unit.value} key={unit.label}>
              {unit.value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
