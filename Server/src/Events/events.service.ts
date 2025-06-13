import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AlertService } from '../Alerts/alert.service';
import { AlertType } from '../types';
import { getEventNameFromType } from '../utils/eventUtils';

// Define event payload interfaces
export interface AlertEvent {
  type: AlertType;
  userId: string;
  metadata?: any;
  broadcastToUserInventory?: boolean; // Flag to indicate if we should send to all users in the same inventory as userId
}

// Event constants - direct mapping to the 6 alert types
export enum EventTypes {
  ADD_KITCHEN = 'event.add_kitchen',
  EDIT_KITCHEN = 'event.edit_kitchen',
  ADD_TO_SHOPPING_LIST = 'event.add_to_shopping_list',
  EDIT_SHOPPING_LIST = 'event.edit_shopping_list',
  USER_ENTERED_KITCHEN = 'event.user_entered_kitchen',
  USER_LEFT_KITCHEN = 'event.user_left_kitchen'
}

@Injectable()
export class EventsService {  constructor(
    private eventEmitter: EventEmitter2,
    private alertService: AlertService, // Use AlertService directly
  ) {
    // Listen to events emitted by other modules - all use the same handler
    this.eventEmitter.on(EventTypes.ADD_KITCHEN, this.handleAlertEvent.bind(this));
    this.eventEmitter.on(EventTypes.EDIT_KITCHEN, this.handleAlertEvent.bind(this));
    this.eventEmitter.on(EventTypes.USER_ENTERED_KITCHEN, this.handleAlertEvent.bind(this));
    this.eventEmitter.on(EventTypes.USER_LEFT_KITCHEN, this.handleAlertEvent.bind(this));
    this.eventEmitter.on(EventTypes.ADD_TO_SHOPPING_LIST, this.handleAlertEvent.bind(this));
    this.eventEmitter.on(EventTypes.EDIT_SHOPPING_LIST, this.handleAlertEvent.bind(this));
  }  /**
   * Unified handler for all alert events using AlertService
   */
  private async handleAlertEvent(payload: AlertEvent) {
    const eventName = getEventNameFromType(payload.type);
    
    console.log(`[EventsService] Handling ${eventName} event:`, {
      userId: payload.userId,
      type: payload.type,
      broadcastToUserInventory: payload.broadcastToUserInventory
    });
      try {
      if (payload.broadcastToUserInventory) {
        // Create alerts for all users in the same inventory as the userId
        await this.alertService.createAlertForUserInventoryByType(payload.userId, {
          type: payload.type,
          metadata: payload.metadata,
        });
        console.log(`[EventsService] Successfully created ${eventName} alerts for user inventory`);

        // For USER_LEFT_KITCHEN events, also create an alert for the user themselves
        // since they may no longer be in the inventory we just broadcast to
        if (payload.type === AlertType.USER_LEFT_KITCHEN) {
          const selfAlert = await this.alertService.createAlertByType({
            type: payload.type,
            userId: payload.userId,
            metadata: payload.metadata,
          });
          console.log(`[EventsService] Also created ${eventName} alert for user themselves:`, selfAlert.id);
        }
      } else {
        // Create alert just for the specified user
        const alert = await this.alertService.createAlertByType({
          type: payload.type,
          userId: payload.userId,
          metadata: payload.metadata,
        });
        console.log(`[EventsService] Successfully created ${eventName} alert:`, alert.id);
      }} catch (error) {
      console.error(`[EventsService] Error creating ${eventName} alert:`, error);
    }
  }
}
