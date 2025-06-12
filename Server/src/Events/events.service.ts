import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlertService } from '../Alerts/alert.service';
import { AlertType } from '../types';

// Define event payload interfaces
export interface AlertEvent {
  type: AlertType;
  userId: string;
  title: string;
  description?: string;
  relatedUserId?: string;
  relatedUserName?: string;
  metadata?: any;
  kitchenId?: string;
}

// Event constants - focused on the 6 original alert types
export enum EventTypes {
  KITCHEN_ALERT = 'kitchen.alert',          // For ADD_KITCHEN, EDIT_KITCHEN
  SHOPPING_LIST_ALERT = 'shopping.list.alert', // For ADD_TO_SHOPPING_LIST, EDIT_SHOPPING_LIST
  USER_KITCHEN_ALERT = 'user.kitchen.alert',   // For USER_ENTERED_KITCHEN, USER_LEFT_KITCHEN
}

@Injectable()
export class EventsService {
  constructor(
    private eventEmitter: EventEmitter2,
    private alertService: AlertService,
  ) {
    // Kitchen related events (ADD_KITCHEN, EDIT_KITCHEN)
    this.eventEmitter.on(EventTypes.KITCHEN_ALERT, (payload: AlertEvent) => {
      this.handleAlertEvent(payload);
    });

    // User in kitchen events (USER_ENTERED_KITCHEN, USER_LEFT_KITCHEN)
    this.eventEmitter.on(EventTypes.USER_KITCHEN_ALERT, (payload: AlertEvent) => {
      this.handleAlertEvent(payload);
    });

    // Shopping list related events (ADD_TO_SHOPPING_LIST, EDIT_SHOPPING_LIST)
    this.eventEmitter.on(EventTypes.SHOPPING_LIST_ALERT, (payload: AlertEvent) => {
      this.handleAlertEvent(payload);
    });
  }

  /**
   * Emit an alert event
   * @param eventName The event name/type
   * @param payload The alert data
   */
  emitEvent(eventName: EventTypes, payload: AlertEvent) {
    this.eventEmitter.emit(eventName, payload);
  }

  /**
   * Create a kitchen-related alert (ADD_KITCHEN, EDIT_KITCHEN)
   */
  emitKitchenAlert(payload: AlertEvent) {
    if (![AlertType.ADD_KITCHEN, AlertType.EDIT_KITCHEN].includes(payload.type)) {
      console.warn(`Invalid alert type ${payload.type} for KITCHEN_ALERT`);
      return;
    }
    this.eventEmitter.emit(EventTypes.KITCHEN_ALERT, payload);
  }

  /**
   * Create a user-kitchen alert (USER_ENTERED_KITCHEN, USER_LEFT_KITCHEN)
   */
  emitUserKitchenAlert(payload: AlertEvent) {
    if (![AlertType.USER_ENTERED_KITCHEN, AlertType.USER_LEFT_KITCHEN].includes(payload.type)) {
      console.warn(`Invalid alert type ${payload.type} for USER_KITCHEN_ALERT`);
      return;
    }
    this.eventEmitter.emit(EventTypes.USER_KITCHEN_ALERT, payload);
  }

  /**
   * Create a shopping list alert (ADD_TO_SHOPPING_LIST, EDIT_SHOPPING_LIST)
   */
  emitShoppingListAlert(payload: AlertEvent) {
    if (![AlertType.ADD_TO_SHOPPING_LIST, AlertType.EDIT_SHOPPING_LIST].includes(payload.type)) {
      console.warn(`Invalid alert type ${payload.type} for SHOPPING_LIST_ALERT`);
      return;
    }
    this.eventEmitter.emit(EventTypes.SHOPPING_LIST_ALERT, payload);
  }

  /**
   * Handle any alert event by creating an alert record
   */
  private async handleAlertEvent(payload: AlertEvent) {
    await this.alertService.createAlert({
      type: payload.type,
      title: payload.title,
      description: payload.description,
      userId: payload.userId,
      relatedUserId: payload.relatedUserId,
      relatedUserName: payload.relatedUserName,
      metadata: {
        ...payload.metadata,
        kitchenId: payload.kitchenId,
      },
    });
  }
}
