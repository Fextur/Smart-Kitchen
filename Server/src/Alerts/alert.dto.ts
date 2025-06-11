import { IsEnum, IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { AlertType } from '../types';

export class CreateAlertDto {
  @IsEnum(AlertType)
  type: AlertType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  relatedUserId?: string;

  @IsOptional()
  @IsString()
  relatedUserName?: string;

  @IsOptional()
  metadata?: any;
}

export class UpdateAlertDto {
  @IsUUID()
  id: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isApproved?: boolean;
}

export class MarkAlertAsReadDto {
  @IsUUID()
  alertId: string;
}

export class ApproveAlertDto {
  @IsUUID()
  alertId: string;
}

export class MarkAllAsReadDto {
  @IsUUID()
  userId: string;
}
