import { RecipeIngredient } from "@/types";

// Utility function for intelligent rounding
const smartRound = (num: number): number => {
  // If it's essentially a whole number, return it as integer
  if (Math.abs(num - Math.round(num)) < 0.0001) {
    return Math.round(num);
  }

  // If it's close to a single decimal place, round to 1 decimal
  if (Math.abs(num - Math.round(num * 10) / 10) < 0.001) {
    return Math.round(num * 10) / 10;
  }

  // Otherwise round to 2 decimal places
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const getIngredientSize = (
  ingredient: RecipeIngredient,
  servings: number
): number => {
  const baseAmount = ingredient.baseAmount || 0;
  const perServingAmount = ingredient.perServingAmount || 0;

  const rawSize = baseAmount + perServingAmount * servings;

  // Use smart rounding to fix floating point precision
  return smartRound(rawSize);
};
