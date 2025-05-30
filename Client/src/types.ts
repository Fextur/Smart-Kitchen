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
