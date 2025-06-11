export enum MeasureUnit {
  GRAM = 'גרם',
  KILOGRAM = 'קילוגרם',
  LITER = 'ליטר',
  MILLILITER = 'מיליליטר',
  UNIT = 'יחידות',
}

export enum Preferences {
  DIETARY = 'דיאטטי',
  VEGETARIAN = 'צמחוני',
  VEGAN = 'טבעוני',
  HIGH_PROTEIN = 'ערך חלבון גבוהה',
  SPICY = 'חריף',
  SWEET = 'מתוק',
  SALTY = 'מלוח',
  SOUR = 'חמוץ',
}

export enum AlertType {
  ADD_KITCHEN = 'add_kitchen',
  EDIT_KITCHEN = 'edit_kitchen',
  ADD_TO_SHOPPING_LIST = 'add_to_shopping_list',
  EDIT_SHOPPING_LIST = 'edit_shopping_list',
  USER_ENTERED_KITCHEN = 'user_entered_kitchen',
  USER_LEFT_KITCHEN = 'user_left_kitchen'
}
