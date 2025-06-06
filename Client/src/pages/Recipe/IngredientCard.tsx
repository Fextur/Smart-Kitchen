import { FC } from "react";
import { Box, Typography } from "@mui/material";

interface IngredientCardProps {
  ingredientName: string;
  ingredientSize: number;
  ingredientMeasureUnit: string;
  isMissing?: boolean;
}

export const IngredientCard: FC<IngredientCardProps> = ({
  ingredientName,
  ingredientMeasureUnit,
  ingredientSize,
  isMissing = false,
}) => {
  return (
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
        minHeight: 45,
        borderRadius: "50px",
      }}
    >
      <Box sx={{ pr: 1.25 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: 500, color: "text.primary" }}
        >
          {ingredientSize} {ingredientMeasureUnit} {ingredientName}
        </Typography>
      </Box>
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: isMissing ? "#E49A61" : "#34C759",
          flexShrink: 0,
        }}
      />
    </Box>
  );
};
