export enum SizeUnit {
  GRAM = "גרם",
  KILOGRAM = "קילוגרם",
  LITER = "ליטר",
  MILLILITER = "מיליליטר",
  UNIT = "יחידות",
}

export enum AlertType {
  ADD_KITCHEN = "add_kitchen",
  EDIT_KITCHEN = "edit_kitchen",
  ADD_TO_SHOPPING_LIST = "add_to_shopping_list",
  EDIT_SHOPPING_LIST = "edit_shopping_list",
  USER_ENTERED_KITCHEN = "user_entered_kitchen",
  USER_LEFT_KITCHEN = "user_left_kitchen",
}

export type Alert = {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
  relatedUserId?: string;
  relatedUserName?: string;
  metadata?: any;
  // Keep message and timestamp for backward compatibility with UI
  message: string;
  timestamp: string;
};

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
