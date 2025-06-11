import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './alert.entity';
import { AlertType } from '../types';
import { CreateAlertDto, UpdateAlertDto } from './alert.dto';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
  ) {}

  async getUserAlerts(userId: string): Promise<Alert[]> {
    return this.alertRepository.find({
      where: { userId },
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

  async approveAlert(alertId: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({
      where: { id: alertId },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found');
    }

    alert.isApproved = true;
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
  }

  async createShoppingListAlert(userId: string, type: AlertType.ADD_TO_SHOPPING_LIST | AlertType.EDIT_SHOPPING_LIST, itemName: string) {
    const title = type === AlertType.ADD_TO_SHOPPING_LIST ? 'נוסף לרשימת קניות' : 'רשימת קניות עודכנה';
    const description = type === AlertType.ADD_TO_SHOPPING_LIST ? 
      `"${itemName}" נוסף לרשימת הקניות` : 
      `פריט "${itemName}" עודכן ברשימת הקניות`;

    return this.createAlert({
      type,
      title,
      description,
      userId,
      metadata: { itemName }
    });
  }

  async createUserKitchenAlert(userId: string, type: AlertType.USER_ENTERED_KITCHEN | AlertType.USER_LEFT_KITCHEN, relatedUserId: string, relatedUserName: string) {
    const title = type === AlertType.USER_ENTERED_KITCHEN ? 'משתמש נכנס למטבח' : 'משתמש יצא מהמטבח';
    const description = type === AlertType.USER_ENTERED_KITCHEN ? 
      `${relatedUserName} נכנס למטבח` : 
      `${relatedUserName} יצא מהמטבח`;

    return this.createAlert({
      type,
      title,
      description,
      userId,
      relatedUserId,
      relatedUserName
    });
  }
}
