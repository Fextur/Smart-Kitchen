import { FC } from "react";
import { Box, Typography } from "@mui/material";
import { Drawer } from "@/components/Drawer";
import { IngredientCard } from "./IngredientCard";
import { Recipe, RecipeIngredient } from "@/types";
import { KitchenItemList } from "@/components/KitchenItemList/KitchenItemList";
import { getIngredientSize } from "@/utils/recipeUtils";

interface IngredientsDrawerProps {
  open: boolean;
  onClose: () => void;
  recipe: Recipe;
  servings: number;
}

export const IngredientsDrawer: FC<IngredientsDrawerProps> = ({
  open,
  onClose,
  recipe,
  servings,
}) => {
  return (
    <Drawer open={open} onClose={onClose}>
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: "grey.300",
          borderRadius: 2,
          margin: "0 auto 16px",
        }}
      />

      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        מצרכים
      </Typography>

      <Box sx={{ pr: 2, pl: 2 }}>
        {recipe.missingItems && recipe.missingItems.length > 0 && (
          <Box>
            <KitchenItemList
              itemsCount={recipe.missingItems.length}
              title="חסרים במטבח"
              initialCollapsed={false}
              renderRow={(index) => (
                <IngredientCard
                  ingredientName={recipe.missingItems![index].name}
                  ingredientMeasureUnit={
                    recipe.missingItems![index].measureUnit
                  }
                  ingredientSize={recipe.missingItems![index].size}
                  isMissing
                />
              )}
              maxHeight="250px"
              cardHeight={50}
            />
          </Box>
        )}
        <Box>
          <KitchenItemList
            itemsCount={recipe.ingredients.length}
            title="כל המצרכים"
            initialCollapsed={false}
            renderRow={(index) => (
              <IngredientCard
                ingredientName={recipe.ingredients[index].name}
                ingredientMeasureUnit={recipe.ingredients[index].unit}
                ingredientSize={getIngredientSize(
                  recipe.ingredients[index],
                  servings
                )}
              />
            )}
            maxHeight="250px"
            cardHeight={50}
          />
        </Box>
      </Box>
    </Drawer>
  );
};
