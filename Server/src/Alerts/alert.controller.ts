import { Controller, Get, Param, Post, Body, Put, Query } from '@nestjs/common';
import { AlertService } from './alert.service';
import { Alert } from './alert.entity';
import { CreateAlertDto, MarkAlertAsReadDto, MarkAllAsReadDto } from './alert.dto';

@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get('user/:id')
  async getUserAlerts(
    @Param('id') userId: string,
    @Query('includeRead') includeRead?: string
  ): Promise<Alert[]> {
    const shouldIncludeRead = includeRead === 'true';
    return this.alertService.getUserAlerts(userId, shouldIncludeRead);
  }

  @Get('user/:id/unread-count')
  async getUnreadCount(@Param('id') userId: string): Promise<{ count: number }> {
    const count = await this.alertService.getUnreadCount(userId);
    return { count };
  }

  @Post()
  async createAlert(@Body() dto: CreateAlertDto): Promise<Alert> {
    return this.alertService.createAlert(dto);
  }
  @Put('mark-read')
  async markAsRead(@Body() dto: MarkAlertAsReadDto): Promise<Alert> {
    return this.alertService.markAsRead(dto.alertId);
  }

  @Put('mark-all-read')
  async markAllAsRead(@Body() dto: MarkAllAsReadDto): Promise<{ message: string }> {
    await this.alertService.markAllAsRead(dto.userId);
    return { message: 'All alerts marked as read' };
  }
}
