import { AlertType } from '../types';

/**
 * Helper function to get a readable event name from AlertType
 */
export const getEventNameFromType = (type: AlertType): string => {
  switch (type) {
    case AlertType.ADD_KITCHEN:
      return 'ADD_KITCHEN';
    case AlertType.EDIT_KITCHEN:
      return 'EDIT_KITCHEN';
    case AlertType.ADD_TO_SHOPPING_LIST:
      return 'ADD_TO_SHOPPING_LIST';
    case AlertType.EDIT_SHOPPING_LIST:
      return 'EDIT_SHOPPING_LIST';
    case AlertType.USER_ENTERED_KITCHEN:
      return 'USER_ENTERED_KITCHEN';
    case AlertType.USER_LEFT_KITCHEN:
      return 'USER_LEFT_KITCHEN';
    default:
      return 'UNKNOWN_EVENT';
  }
};
