// Client/src/utils/recipeUtils.tsx
import { RecipeIngredient } from "@/types";

export const getIngredientSize = (
  ingredient: RecipeIngredient,
  servings: number
) =>
  (ingredient.baseAmount || 0) + (ingredient.perServingAmount || 0) * servings;
