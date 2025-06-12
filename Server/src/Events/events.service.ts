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
    private alertService: AlertService,
  ) {
    // Kitchen related events
    this.eventEmitter.on(EventTypes.ADD_KITCHEN, this.handleAddKitchenEvent.bind(this));
    this.eventEmitter.on(EventTypes.EDIT_KITCHEN, this.handleEditKitchenEvent.bind(this));

    // User in kitchen events
    this.eventEmitter.on(EventTypes.USER_ENTERED_KITCHEN, this.handleUserEnteredKitchenEvent.bind(this));
    this.eventEmitter.on(EventTypes.USER_LEFT_KITCHEN, this.handleUserLeftKitchenEvent.bind(this));

    // Shopping list related events
    this.eventEmitter.on(EventTypes.ADD_TO_SHOPPING_LIST, this.handleAddToShoppingListEvent.bind(this));
    this.eventEmitter.on(EventTypes.EDIT_SHOPPING_LIST, this.handleEditShoppingListEvent.bind(this));
  }

  /**
   * Emit an alert event
   * @param eventName The event name/type
   * @param payload The alert data
   */
  emitEvent(eventName: EventTypes, payload: AlertEvent) {
    this.eventEmitter.emit(eventName, payload);
  }  /**

    /**
   * Handle ADD_KITCHEN event
   */
  private async handleAddKitchenEvent(payload: AlertEvent) {
    console.log('[EventsService] Handling ADD_KITCHEN event:', {
      userId: payload.userId,
      title: payload.title
    });
    
    try {
      const alert = await this.alertService.createAlert({
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
      console.log('[EventsService] Successfully created ADD_KITCHEN alert:', alert.id);
    } catch (error) {
      console.error('[EventsService] Error creating ADD_KITCHEN alert:', error);
    }
  }

  /**
   * Handle EDIT_KITCHEN event
   */
  private async handleEditKitchenEvent(payload: AlertEvent) {
    console.log('[EventsService] Handling EDIT_KITCHEN event:', {
      userId: payload.userId,
      title: payload.title
    });
    
    try {
      const alert = await this.alertService.createAlert({
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
      console.log('[EventsService] Successfully created EDIT_KITCHEN alert:', alert.id);
    } catch (error) {
      console.error('[EventsService] Error creating EDIT_KITCHEN alert:', error);
    }
  }

  /**
   * Handle USER_ENTERED_KITCHEN event
   */
  private async handleUserEnteredKitchenEvent(payload: AlertEvent) {
    console.log('[EventsService] Handling USER_ENTERED_KITCHEN event:', {
      userId: payload.userId,
      title: payload.title
    });
    
    try {
      const alert = await this.alertService.createAlert({
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
      console.log('[EventsService] Successfully created USER_ENTERED_KITCHEN alert:', alert.id);
    } catch (error) {
      console.error('[EventsService] Error creating USER_ENTERED_KITCHEN alert:', error);
    }
  }

  /**
   * Handle USER_LEFT_KITCHEN event
   */
  private async handleUserLeftKitchenEvent(payload: AlertEvent) {
    console.log('[EventsService] Handling USER_LEFT_KITCHEN event:', {
      userId: payload.userId,
      title: payload.title
    });
    
    try {
      const alert = await this.alertService.createAlert({
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
      console.log('[EventsService] Successfully created USER_LEFT_KITCHEN alert:', alert.id);
    } catch (error) {
      console.error('[EventsService] Error creating USER_LEFT_KITCHEN alert:', error);
    }
  }

  /**
   * Handle ADD_TO_SHOPPING_LIST event
   */
  private async handleAddToShoppingListEvent(payload: AlertEvent) {
    console.log('[EventsService] Handling ADD_TO_SHOPPING_LIST event:', {
      userId: payload.userId,
      title: payload.title
    });
    
    try {
      const alert = await this.alertService.createAlert({
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
      console.log('[EventsService] Successfully created ADD_TO_SHOPPING_LIST alert:', alert.id);
    } catch (error) {
      console.error('[EventsService] Error creating ADD_TO_SHOPPING_LIST alert:', error);
    }
  }

  /**
   * Handle EDIT_SHOPPING_LIST event
   */
  private async handleEditShoppingListEvent(payload: AlertEvent) {
    console.log('[EventsService] Handling EDIT_SHOPPING_LIST event:', {
      userId: payload.userId,
      title: payload.title
    });
    
    try {
      const alert = await this.alertService.createAlert({
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
      console.log('[EventsService] Successfully created EDIT_SHOPPING_LIST alert:', alert.id);
    } catch (error) {
      console.error('[EventsService] Error creating EDIT_SHOPPING_LIST alert:', error);
    }
  }
}
