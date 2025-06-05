import { RecipeResponse } from "@/types";
import { Box, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { useSwipeable } from "react-swipeable";

interface RecipeSwipeViewProps {
  recipes: RecipeResponse[];
  currentRecipeIndex: number;
  setCurrentRecipeIndex: Dispatch<SetStateAction<number>>;
}

const RecipeSwipeView = ({
  recipes,
  currentRecipeIndex,
  setCurrentRecipeIndex,
}: RecipeSwipeViewProps) => {
  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentRecipeIndex((prevIndex) =>
        prevIndex === recipes.length - 1 ? 0 : prevIndex + 1
      ),
    onSwipedRight: () =>
      setCurrentRecipeIndex((prevIndex) =>
        prevIndex === 0 ? recipes.length - 1 : prevIndex - 1
      ),
    trackMouse: true,
  });

  const current = recipes[currentRecipeIndex];

  return (
    <Box
      {...handlers}
      sx={{
        maxWidth: 600,
        textAlign: "center",
        userSelect: "none",
        border: "1px solid #ddd",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography
        sx={{ whiteSpace: "pre-line", minHeight: 150, direction: "rtl" }}
      >
        {current.recipe}
      </Typography>

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: "bold",
          mt: 3,
          mb: 1,
          direction: "rtl",
          color: "black",
        }}
      >
        מצרכים נוספים לרכישה:
      </Typography>
      {current.extraProducts?.length === 0 ? (
        <Typography>אין</Typography>
      ) : (
        current.extraProducts?.map((extra, idx) => (
          <Typography key={idx} sx={{ whiteSpace: "nowrap", direction: "rtl" }}>
            • {extra.name} - {extra.size} {extra.measureUnit}
          </Typography>
        ))
      )}

      <Typography sx={{ mt: 2 }}>
        מתכון {currentRecipeIndex + 1} מתוך {recipes.length}
      </Typography>
    </Box>
  );
};

export default RecipeSwipeView;
