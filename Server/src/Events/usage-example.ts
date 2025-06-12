/**
 * This file is an example of how to use the EventsService in other services
 * You can copy this pattern to any service where you want to create alerts
 */

import { Injectable } from '@nestjs/common';
import { EventsService, AlertEvent } from './events.service';
import { AlertType } from '../types';

@Injectable()
export class ExampleService {
  constructor(private eventsService: EventsService) {}

  // Example: Creating a kitchen alert
  async notifyKitchenCreated(userId: string, kitchenName: string) {
    const alertPayload: AlertEvent = {
      type: AlertType.ADD_KITCHEN,
      userId,
      title: 'מטבח חדש נוצר',
      description: `המטבח "${kitchenName}" נוצר בהצלחה`,
      metadata: {
        kitchenName,
      },
    };

    // Using the specific kitchen alert emitter
    this.eventsService.emitKitchenAlert(alertPayload);
  }

  // Example: Creating a shopping list alert
  async notifyItemAddedToShoppingList(userId: string, itemName: string) {
    const alertPayload: AlertEvent = {
      type: AlertType.ADD_TO_SHOPPING_LIST,
      userId,
      title: 'נוסף לרשימת קניות',
      description: `"${itemName}" נוסף לרשימת הקניות`,
      metadata: {
        itemName,
      },
    };

    // Using the specific shopping list alert emitter
    this.eventsService.emitShoppingListAlert(alertPayload);
  }

  // Example: Creating a user kitchen alert
  async notifyUserEnteredKitchen(userId: string, relatedUserId: string, relatedUserName: string) {
    const alertPayload: AlertEvent = {
      type: AlertType.USER_ENTERED_KITCHEN,
      userId,
      title: 'משתמש נכנס למטבח',
      description: `${relatedUserName} נכנס למטבח`,
      relatedUserId,
      relatedUserName,
    };

    // Using the specific user kitchen alert emitter
    this.eventsService.emitUserKitchenAlert(alertPayload);
  }
}
