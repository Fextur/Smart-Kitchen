import { FC, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { ScrollText } from "lucide-react";
import { IngredientsDrawer } from "@/pages/Recipe/IngredientsDrawer";
import { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  onSelect?: () => void;
  servings?: number;
  isNew?: boolean;
  showPreperationTime?: boolean;
  showIngredients?: boolean;
}

export const RecipeCard: FC<RecipeCardProps> = ({
  recipe,
  onSelect,
  servings = 0,
  isNew = false,
  showPreperationTime = true,
  showIngredients = true,
}) => {
  const [showIngredientsDrawer, setShowIngredientsDrawer] = useState(false);

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
        onClick={() => onSelect && onSelect()}
      >
        <Box sx={{ pr: 1.25, textAlign: "right", flexGrow: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 500, color: "text.primary" }}
            >
              {recipe.name}
            </Typography>
            {!isNew && recipe.lastAccessedAt && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                לפני{" "}
                {Math.ceil(
                  (new Date().getTime() -
                    new Date(recipe.lastAccessedAt).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                ימים
              </Typography>
            )}
          </Box>
          {showPreperationTime && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {recipe.totalTimeMinutes} דק' הכנה
              </Typography>
            </Box>
          )}
        </Box>
        {showIngredients && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setShowIngredientsDrawer(true);
            }}
            size="small"
            sx={{
              color: "error.main",
              "&:hover": {
                bgcolor: "error.light",
                color: "white",
              },
            }}
          >
            <ScrollText
              size={20}
              color={
                recipe.missingItems && recipe.missingItems.length > 0
                  ? "#ef4444"
                  : "gray"
              }
            />
          </IconButton>
        )}
      </Box>
      <IngredientsDrawer
        open={showIngredientsDrawer}
        onClose={() => setShowIngredientsDrawer(false)}
        recipe={recipe}
        servings={servings}
      />
    </>
  );
};
