import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
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

  async getUserAlerts(
    userId: string,
    includeRead: boolean = false,
  ): Promise<Alert[]> {
    const whereCondition = includeRead ? { userId } : { userId, isRead: false }; // Only unread alerts by default

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
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.alertRepository.count({
      where: { userId, isRead: false },
    });
  }

  //---------------------- Helpers ----------------------//
  // Helper methods for creating specific alert types
  async createKitchenAlert(
    userId: string,
    type: AlertType.ADD_KITCHEN | AlertType.EDIT_KITCHEN,
    kitchenName: string,
    metadata?: any,
  ) {
    if (type === AlertType.ADD_KITCHEN) {
      const title = 'מטבח חדש נוצר';
      const description = `המטבח "${kitchenName}" נוצר בהצלחה`;

      return this.createAlert({
        type,
        title,
        description,
        userId,
        metadata: { kitchenName },
      });
    } else {
      // EDIT_KITCHEN - handle product operations
      const action = metadata?.action;

      if (action && action.startsWith('product-')) {
        return this.createKitchenProductAlert(userId, type, metadata);
      } else {
        // Generic kitchen update
        const title = 'מטבח עודכן';
        const description = `המטבח "${kitchenName}" עודכן`;

        return this.createAlert({
          type,
          title,
          description,
          userId,
          metadata: { kitchenName },
        });
      }
    }
  }
  /**
   * Create alerts for all users in the same inventory EXCEPT the current user
   */
  async createAlertForUserInventoryByType(
    currentUserId: string, // This is the user who performed the action
    alertPayload: {
      type: AlertType;
      metadata?: any;
    },
  ): Promise<Alert[]> {
    try {
      console.log(
        `[AlertService] Creating alerts for all users in the same inventory as user: ${currentUserId}, excluding the current user`,
      );
      console.log(`[AlertService] Alert type: ${alertPayload.type}`);
      console.log(`[AlertService] Metadata:`, alertPayload.metadata);

      // First, get the name of the user who performed the action
      let actionUserName: string;
      try {
        const actionUser = await this.userService.findById(currentUserId);
        actionUserName = actionUser?.name || 'משתמש';
        console.log(
          `[AlertService] Action performed by: ${actionUserName} (ID: ${currentUserId})`,
        );
      } catch (error) {
        console.error(
          '[AlertService] Error looking up action user name:',
          error,
        );
        actionUserName = 'משתמש';
      }

      let inventoryId: string;

      // For USER_LEFT_KITCHEN events, use the previous inventory ID from metadata
      if (
        alertPayload.type === AlertType.USER_LEFT_KITCHEN &&
        alertPayload.metadata?.previousInventoryId
      ) {
        inventoryId = alertPayload.metadata.previousInventoryId;
        console.log(
          `[AlertService] Using previous inventory ID for USER_LEFT_KITCHEN: ${inventoryId}`,
        );
      } else {
        // For other events, get the user's current inventory
        const userWithInventory =
          await this.userService.findById(currentUserId);
        if (!userWithInventory || !userWithInventory.inventory) {
          console.warn(
            `[AlertService] User ${currentUserId} not found or has no inventory`,
          );
          return [];
        }
        inventoryId = userWithInventory.inventory.id;
        console.log(
          `[AlertService] Using current inventory ID: ${inventoryId}`,
        );
      }

      const inventoryUsers =
        await this.userService.getUsersByInventoryId(inventoryId);
      console.log(
        `[AlertService] Found ${inventoryUsers.length} users in inventory ${inventoryId}`,
      );

      // FILTER OUT THE CURRENT USER - this is the key fix
      const otherUsers = inventoryUsers.filter(
        (user) => user.id !== currentUserId,
      );
      console.log(
        `[AlertService] After excluding current user, ${otherUsers.length} users will receive alerts`,
      );

      if (!otherUsers.length) {
        console.log(
          `[AlertService] No other users found in inventory: ${inventoryId}`,
        );
        return [];
      }

      // Create alerts for each user EXCEPT the current user
      const alerts = await Promise.all(
        otherUsers.map((user) => {
          console.log(
            `[AlertService] Creating alert for user: ${user.id} (${user.name})`,
          );

          // Add the action user's name to the metadata so the alert service can use it
          const enhancedMetadata = {
            ...alertPayload.metadata,
            name: actionUserName, // Add the action user's name
            actionUserId: currentUserId, // Add the action user's ID
          };

          return this.createAlertByType({
            ...alertPayload,
            userId: user.id, // This is the user who will RECEIVE the alert
            metadata: enhancedMetadata,
          });
        }),
      );

      console.log(
        `[AlertService] Successfully created ${alerts.length} alerts for other inventory users`,
      );
      return alerts;
    } catch (error) {
      console.error(
        `[AlertService] Error creating alerts for user inventory:`,
        error,
      );
      throw error;
    }
  }

  // Also update the individual alert creation methods to prioritize the action user info:

  async createKitchenProductAlert(
    userId: string, // This is the user RECEIVING the alert
    type: AlertType.EDIT_KITCHEN,
    metadata: any,
  ) {
    const action = metadata?.action;
    const itemNames = metadata?.itemName || [];
    const itemName = Array.isArray(itemNames) ? itemNames[0] : itemNames;

    // Get user name - prioritize the action user's name from metadata
    let userName = metadata?.name || metadata?.userName; // This should be the action user's name

    if (!userName) {
      // Fallback: try to look up by actionUserId
      try {
        const actionUserId = metadata?.actionUserId;
        if (actionUserId) {
          const actionUser = await this.userService.findById(actionUserId);
          userName = actionUser?.name || 'משתמש';
        } else {
          // Last resort: if no action user info, use "משתמש"
          userName = 'משתמש';
        }
      } catch (error) {
        console.error('Error looking up action user name:', error);
        userName = 'משתמש';
      }
    }

    let title: string;
    let description: string;

    switch (action) {
      case 'product-created':
        title = 'מוצר נוסף';
        description = `${itemName} נוסף על ידי ${userName}`;
        if (metadata?.size && metadata?.measureUnit) {
          description += ` (${metadata.size} ${metadata.measureUnit})`;
        }
        break;

      case 'product-created-fallback':
        title = 'מוצר נוסף';
        description = `${itemName} נוסף על ידי ${userName}`;
        break;

      case 'product-quantity-updated':
        title = 'כמות עודכנה';

        if (metadata?.newSize && metadata?.newUnit) {
          description = `${itemName} עודכן על ידי ${userName} ל-${metadata.newSize} ${metadata.newUnit}`;
        } else if (metadata?.size && metadata?.measureUnit) {
          description = `${itemName} עודכן על ידי ${userName} ל-${metadata.size} ${metadata.measureUnit}`;
        } else if (metadata?.newSize) {
          description = `${itemName} עודכן על ידי ${userName} ל-${metadata.newSize}`;
        } else {
          description = `${itemName} עודכן על ידי ${userName}`;
        }
        break;

      case 'product-updated':
        title = 'מוצר עודכן';
        description = `${itemName} עודכן על ידי ${userName}`;

        if (metadata?.size && metadata?.measureUnit) {
          description += ` ל-${metadata.size} ${metadata.measureUnit}`;
        }
        break;

      case 'product-deleted':
        title = 'מוצר הוסר';
        description = `${itemName} הוסר על ידי ${userName}`;
        break;

      case 'product-transferred-from-shopping':
        title = 'הועבר מהקניות';
        description = `${itemName} הועבר על ידי ${userName}`;
        if (metadata?.size && metadata?.measureUnit) {
          description += ` (${metadata.size} ${metadata.measureUnit})`;
        }
        break;

      default:
        title = 'מטבח עודכן';
        description = `עודכן על ידי ${userName}`;
    }

    return this.createAlert({
      type,
      title,
      description,
      userId, // This is the user RECEIVING the alert
      metadata,
    });
  }

  async createShoppingListAlert(
    userId: string, // This is the user RECEIVING the alert
    type: AlertType.ADD_TO_SHOPPING_LIST | AlertType.EDIT_SHOPPING_LIST,
    itemName: string,
    metadata?: any,
  ) {
    const title =
      type === AlertType.ADD_TO_SHOPPING_LIST ? 'נוסף לקניות' : 'קניות עודכנו';

    // Get user name - prioritize the action user's name from metadata
    let userName = metadata?.name || metadata?.userName; // This should be the action user's name

    if (!userName) {
      // Fallback: try to look up by actionUserId
      try {
        const actionUserId = metadata?.actionUserId;
        if (actionUserId) {
          const actionUser = await this.userService.findById(actionUserId);
          userName = actionUser?.name || 'משתמש';
        } else {
          // Last resort: if no action user info, use "משתמש"
          userName = 'משתמש';
        }
      } catch (error) {
        console.error('Error looking up action user name:', error);
        userName = 'משתמש';
      }
    }

    let description: string;

    if (type === AlertType.ADD_TO_SHOPPING_LIST) {
      description = `${itemName} נוסף על ידי ${userName}`;

      if (metadata?.size && metadata?.measureUnit) {
        description += ` (${metadata.size} ${metadata.measureUnit})`;
      } else if (metadata?.size) {
        description += ` (${metadata.size})`;
      }
    } else {
      // Handle different EDIT actions
      const action = metadata?.action;

      if (action === 'cleared') {
        const itemNames = metadata?.itemNames || itemName;
        const itemCount = metadata?.itemCount || 1;
        description =
          itemCount === 1
            ? `${itemNames} הועבר על ידי ${userName}`
            : `${itemCount} פריטים הועברו על ידי ${userName}`;
      } else if (action === 'removed-from-shopping-list') {
        description = `${itemName} הוסר על ידי ${userName}`;
      } else if (action === 'product-deleted') {
        description = `${itemName} נמחק על ידי ${userName}`;
      } else if (action === 'transferred-shopping-to-kitchen') {
        description = `${itemName} הועבר על ידי ${userName}`;

        if (metadata?.size && metadata?.measureUnit) {
          description += ` (${metadata.size} ${metadata.measureUnit})`;
        } else if (metadata?.size) {
          description += ` (${metadata.size})`;
        }
      } else if (action === 'transferred_to_shopping_list') {
        description = `${itemName} הועבר לקניות על ידי ${userName}`;

        if (metadata?.size && metadata?.measureUnit) {
          description += ` (${metadata.size} ${metadata.measureUnit})`;
        } else if (metadata?.size) {
          description += ` (${metadata.size})`;
        }
      } else if (action === 'quantity-updated') {
        if (metadata?.newSize && metadata?.newUnit) {
          description = `${itemName} עודכן על ידי ${userName} ל-${metadata.newSize} ${metadata.newUnit}`;
        } else if (metadata?.size && metadata?.measureUnit) {
          description = `${itemName} עודכן על ידי ${userName} ל-${metadata.size} ${metadata.measureUnit}`;
        } else if (metadata?.newSize) {
          description = `${itemName} עודכן על ידי ${userName} ל-${metadata.newSize}`;
        } else {
          description = `${itemName} עודכן על ידי ${userName}`;
        }
      } else if (action === 'checked' || action === 'unchecked') {
        const isChecked = action === 'checked';
        description = `${itemName} ${isChecked ? 'סומן' : 'בוטל'} על ידי ${userName}`;

        if (metadata?.size && metadata?.measureUnit) {
          description += ` (${metadata.size} ${metadata.measureUnit})`;
        } else if (metadata?.size) {
          description += ` (${metadata.size})`;
        }
      } else {
        description = `${itemName} עודכן על ידי ${userName}`;

        if (metadata?.size && metadata?.measureUnit) {
          description += ` ל-${metadata.size} ${metadata.measureUnit}`;
        } else if (metadata?.size) {
          description += ` (${metadata.size})`;
        }
      }
    }

    return this.createAlert({
      type,
      title,
      description,
      userId, // This is the user RECEIVING the alert
      metadata: { itemName, ...metadata },
    });
  }

  // Also update the user kitchen alert method we fixed earlier:
  async createUserKitchenAlert(
    userId: string,
    type: AlertType.USER_ENTERED_KITCHEN | AlertType.USER_LEFT_KITCHEN,
    userName: string,
    kitchenName?: string,
  ) {
    const title =
      type === AlertType.USER_ENTERED_KITCHEN
        ? 'משתמש נכנס למטבח'
        : 'משתמש יצא מהמטבח';

    // Fixed the description format with proper Hebrew quotation marks
    const kitchenNameText = kitchenName ? `״${kitchenName}״` : '';
    const description =
      type === AlertType.USER_ENTERED_KITCHEN
        ? `${userName} נכנס למטבח: ${kitchenNameText}`
        : `${userName} יצא מהמטבח: ${kitchenNameText}`;

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
        return this.createKitchenAlert(userId, type, kitchenName, metadata);
      case AlertType.ADD_TO_SHOPPING_LIST:
      case AlertType.EDIT_SHOPPING_LIST:
        const itemName = metadata?.itemName || metadata?.itemNames || 'Item';
        return this.createShoppingListAlert(userId, type, itemName, metadata);
      case AlertType.USER_ENTERED_KITCHEN:
      case AlertType.USER_LEFT_KITCHEN:
        const userName = metadata?.userName || 'User';
        const kitchenNameForUser = metadata?.kitchenName || '';
        return this.createUserKitchenAlert(
          userId,
          type,
          userName,
          kitchenNameForUser,
        );

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
   * Create alerts for all users in the same inventory EXCEPT the current user
   */
}
