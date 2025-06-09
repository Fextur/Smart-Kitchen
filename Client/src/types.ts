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

export type Kitchen = {
  id: string;
  description?: string;
  name?: string;
  kitchenHash: string;
};

export type UserRes = {
  id: string;
  email: string;
  name: string;
  userName: string;
  sensitivities: string[];
  inventory: Kitchen;
  accessToken: string;
};

export type KitchenItem = {
  id: string;
  name: string;
  size: number;
  measureUnit: SizeUnit;
  expirationDate?: string | null;
  latestUpdateDate?: string;
};

export type ShoppingListItem = Omit<KitchenItem, "expirationDate"> & {
  isChecked: boolean;
};

export type RecipeIngredient = {
  productId?: string;
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
  servings: number;
  searchQuery?: string;
  useOnlyAvailable?: boolean;
};
