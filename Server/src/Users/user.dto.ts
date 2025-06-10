import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Length,
  Matches,
} from 'class-validator';
import { User } from './user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @IsOptional()
  sensitivities?: string[];
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  userName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsArray()
  @IsOptional()
  sensitivities?: string[];

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  goal?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  userName: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class JoinInventoryDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  inventoryId: string;
}

export class CreateKitchenDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class JoinKitchenByHashDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @Length(7, 7)
  @Matches(/^[A-F0-9]{7}$/, {
    message: 'Kitchen code must be 7 uppercase alphanumeric characters',
  })
  kitchenHash: string;
}

export class UserWithToken extends User {
  accessToken: string;
}
