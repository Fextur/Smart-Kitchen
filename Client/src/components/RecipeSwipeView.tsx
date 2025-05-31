import { RecipeResponse } from "@/types";
import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";

const RecipeSwipeView = ({ recipes }: { recipes: RecipeResponse[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setCurrentIndex((i) => (i === recipes.length - 1 ? 0 : i + 1)),
    onSwipedRight: () =>
      setCurrentIndex((i) => (i === 0 ? recipes.length - 1 : i - 1)),
    trackMouse: true,
  });

  const current = recipes[currentIndex];

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
            • {extra.name} - {extra.sizeValue} {extra.sizeUnit}
          </Typography>
        ))
      )}

      <Typography sx={{ mt: 2 }}>
        מתכון {currentIndex + 1} מתוך {recipes.length}
      </Typography>
    </Box>
  );
};

export default RecipeSwipeView;
