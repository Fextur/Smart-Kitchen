import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';
import { AlertType } from '../types';
import { CreateAlertDto, UpdateAlertDto } from './alert.dto';
import { UserService } from '../Users/user.service';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  //---------------------- DB handlers ----------------------//

  async getUserAlerts(userId: string, includeRead: boolean = false): Promise<Alert[]> {
    const whereCondition = includeRead 
      ? { userId } 
      : { userId, isRead: false }; // Only unread alerts by default

    return this.alertRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  async createAlert(dto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertRepository.create(dto);
    return this.alertRepository.save(alert);
  }

  async markAsRead(alertId: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    alert.isRead = true;
    return this.alertRepository.save(alert);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.alertRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.alertRepository.count({
      where: { userId, isRead: false },
    });
  }


//---------------------- Helpers ----------------------//
  // Helper methods for creating specific alert types

  async createKitchenAlert(userId: string, type: AlertType.ADD_KITCHEN | AlertType.EDIT_KITCHEN, kitchenName: string) {
    const title = type === AlertType.ADD_KITCHEN ? 'מטבח חדש נוצר' : 'מטבח עודכן';
    const description = type === AlertType.ADD_KITCHEN ? 
      `המטבח "${kitchenName}" נוצר בהצלחה` : 
      `המטבח "${kitchenName}" עודכן`;

    return this.createAlert({
      type,
      title,
      description,
      userId,
      metadata: { kitchenName }
    });
  }  async createShoppingListAlert(userId: string, type: AlertType.ADD_TO_SHOPPING_LIST | AlertType.EDIT_SHOPPING_LIST, itemName: string, metadata?: any) {
    const title = type === AlertType.ADD_TO_SHOPPING_LIST ? 'נוסף לרשימת קניות' : 'רשימת קניות עודכנה';
    
    let description: string;
    if (type === AlertType.ADD_TO_SHOPPING_LIST) {
      description = `"${itemName}" נוסף לרשימת הקניות`;
    } else {
      // Handle different EDIT actions
      const action = metadata?.action;      
      if (action === 'cleared') {
        const itemNames = metadata?.itemNames || itemName;
        const itemCount = metadata?.itemCount || 1;
        description = itemCount === 1 
          ? `הפריט "${itemNames}" הועבר למטבח`          : `${itemCount} פריטים הועברו למטבח: ${itemNames}`;      
        } 
        else if (action === 'removed-from-shopping-list') {
        description = `הפריט "${itemName}" הוסר מרשימת הקניות`;      
      } 
        else if (action === 'product-deleted') {
        description = `הפריט "${itemName}" הוסר מרשימת הקניות (מוצר נמחק)`;
      } else if (action === 'transferred-shopping-to-kitchen') {
        description = `הפריט "${itemName}" הועבר למטבח מרשימת הקניות`;
      } else if (action === 'transferred_to_shopping_list') {
        description = `הפריט "${itemName}" הועבר לרשימת הקניות`;
      } else {
        description = `פריט "${itemName}" עודכן ברשימת הקניות`;
      }
    }

    return this.createAlert({
      type,
      title,
      description,
      userId,
      metadata: { itemName, ...metadata }
    });
  }

  async createUserKitchenAlert(userId: string, type: AlertType.USER_ENTERED_KITCHEN | AlertType.USER_LEFT_KITCHEN, userName: string, kitchenName?: string) {
    const title = type === AlertType.USER_ENTERED_KITCHEN ? 'משתמש נכנס למטבח' : 'משתמש יצא מהמטבח';
    const kitchenNameText = kitchenName ? `"${kitchenName}"` : '';
    const description = type === AlertType.USER_ENTERED_KITCHEN ? 
      `${userName} נכנס ${kitchenNameText} למטבח:` : 
      `${userName} יצא ${kitchenNameText} מהמטבח:`;

    return this.createAlert({
      type,
      title,
      description,
      userId,
    });
  }


//---------------------- Event Handlers ----------------------//
  
  /**
   * Create alert using the appropriate helper method based on type
   */
  async createAlertByType(payload: {
    type: AlertType;
    userId: string;
    metadata?: any;
  }): Promise<Alert> {
    const { type, userId, metadata } = payload;

    switch (type) {
      case AlertType.ADD_KITCHEN:
      case AlertType.EDIT_KITCHEN:
        const kitchenName = metadata?.kitchenName || 'Kitchen';
        return this.createKitchenAlert(userId, type, kitchenName);      case AlertType.ADD_TO_SHOPPING_LIST:
      case AlertType.EDIT_SHOPPING_LIST:
        const itemName = metadata?.itemName || metadata?.itemNames || 'Item';
        return this.createShoppingListAlert(userId, type, itemName, metadata);case AlertType.USER_ENTERED_KITCHEN:
      case AlertType.USER_LEFT_KITCHEN:
        const userName = metadata?.userName || 'User';
        const kitchenNameForUser = metadata?.kitchenName || '';
        return this.createUserKitchenAlert(userId, type, userName, kitchenNameForUser);

      default:
        // Fallback to generic alert creation
        return this.createAlert({
          type,
          userId,
          title: 'Alert',
          description: 'New alert',
          metadata,
        });
    }
  }  
  
  /**
   * Create alerts for all users in the same inventory using the appropriate helper method
   */
  async createAlertForUserInventoryByType(
    userId: string,
    alertPayload: {
      type: AlertType;
      metadata?: any;
    },
  ): Promise<Alert[]> {
    try {
      console.log(`[AlertService] Creating alerts for all users in the same inventory as user: ${userId}`);
      console.log(`[AlertService] Alert type: ${alertPayload.type}`);
      console.log(`[AlertService] Metadata:`, alertPayload.metadata);
      
      let inventoryId: string;
      
      // For USER_LEFT_KITCHEN events, use the previous inventory ID from metadata
      if (alertPayload.type === AlertType.USER_LEFT_KITCHEN && alertPayload.metadata?.previousInventoryId) {
        inventoryId = alertPayload.metadata.previousInventoryId;
        console.log(`[AlertService] Using previous inventory ID for USER_LEFT_KITCHEN: ${inventoryId}`);
      } else {
        // For other events, get the user's current inventory
        const userWithInventory = await this.userService.findById(userId);
        if (!userWithInventory || !userWithInventory.inventory) {
          console.warn(`[AlertService] User ${userId} not found or has no inventory`);
          return [];
        }
        inventoryId = userWithInventory.inventory.id;
        console.log(`[AlertService] Using current inventory ID: ${inventoryId}`);
      }

      const inventoryUsers = await this.userService.getUsersByInventoryId(inventoryId);
      console.log(`[AlertService] Found ${inventoryUsers.length} users in inventory ${inventoryId}`);
      
      if (!inventoryUsers.length) {
        console.log(`[AlertService] No users found in inventory: ${inventoryId}`);
        return [];
      }

      // Create alerts for each user using the type-specific method
      const alerts = await Promise.all(
        inventoryUsers.map(user => {
          console.log(`[AlertService] Creating alert for user: ${user.id} (${user.name})`);
          return this.createAlertByType({
            ...alertPayload,
            userId: user.id,
          });
        }),
      );

      console.log(`[AlertService] Successfully created ${alerts.length} alerts for inventory users`);
      return alerts;
    } catch (error) {
      console.error(`[AlertService] Error creating alerts for user inventory:`, error);
      throw error;
    }
  }
}
