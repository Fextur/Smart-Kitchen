// Client/src/types.ts - Update the recipe-related types

export enum SizeUnit {
  GRAM = "גרם",
  KILOGRAM = "קילוגרם",
  LITER = "ליטר",
  MILLILITER = "מיליליטר",
  UNIT = "יחידות",
}

export type User = {
  id: string;
  email: string;
  name: string;
  userName: string;
  sensitivities: string[];
};

export type RecipeResponse = {
  recipe: string;
  extraProducts?: KitchenItem[];
};

export type Kitchen = {
  id: string;
  description?: string;
  name?: string;
};

export type UserWithKitchen = {
  id: string;
  email: string;
  name: string;
  userName: string;
  sensitivities: string[];
  inventory: Kitchen;
};

export type KitchenItem = {
  id: string;
  name: string;
  size: number;
  measureUnit: SizeUnit;
  expirationDate?: string;
  latestUpdateDate?: string;
};

export enum Preferences {
  VEGETARIAN = "צמחוני",
  VEGAN = "טבעוני",
  GLUTEN_FREE = "ללא גלוטן",
  DAIRY_FREE = "ללא חלב",
  HEALTHY = "בריא",
  QUICK = "מהיר",
  BUDGET = "חסכוני",
  GOURMET = "גורמה",
  KIDS_FRIENDLY = "ידידותי לילדים",
  LOW_CARB = "דל פחמימות",
  HIGH_PROTEIN = "עתיר חלבון",
  MEDITERRANEAN = "ים תיכוני",
}

export type ShoppingListItem = Omit<KitchenItem, "expirationDate"> & {
  isChecked: boolean;
};

export type RecipeIngredient = {
  productId?: string; // Reference to the actual product
  name: string;
  baseAmount: number;
  perServingAmount: number;
  unit: string;
};

export type RecipeStep = {
  stepNumber: number;
  instruction: string;
  isTimerStep?: boolean;
  timerMinutes?: number;
};

export type Recipe = {
  id?: string;
  name: string;
  description: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  totalTimeMinutes: number;
  lastAccessedAt?: Date;
  missingItems?: KitchenItem[];
};

export type GenerateRecipeParams = {
  preferences: string[];
  servings: number;
  allIngredientsAvailable?: boolean;
  searchQuery?: string;
};
