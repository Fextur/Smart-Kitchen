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
  DIETARY = "דיאטטי",
  VEGETARIAN = "צמחוני",
  VEGAN = "טבעוני",
  HIGH_PROTEIN = "ערך חלבון גבוהה",
  SPICY = "חריף",
  SWEET = "מתוק",
  SALTY = "מלוח",
  SOUR = "חמוץ",
}

export type ShoppingListItem = Omit<KitchenItem, "expirationDate"> & {
  isChecked: boolean;
};
