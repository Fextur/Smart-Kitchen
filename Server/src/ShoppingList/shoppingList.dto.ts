import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsDate,
  IsUUID,
} from 'class-validator';
import { MeasureUnit } from 'src/types';
import { Type } from 'class-transformer';

export class ShoppingListProductDto {
  @IsOptional()
  @IsUUID()
  id?: string; // Optional - only present when updating existing product

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  size: number; // This will be added to wantedSize

  @IsEnum(MeasureUnit)
  @IsNotEmpty()
  measureUnit: MeasureUnit;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationDate?: Date;
}

export class CreateShoppingListDto {
  @IsNotEmpty()
  @IsString()
  inventoryId: string;

  @IsArray()
  @Type(() => ShoppingListProductDto)
  products: ShoppingListProductDto[];
}

export class UpdateShoppingListProductDto {
  @IsOptional()
  @IsNumber()
  wantedSize?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(MeasureUnit)
  measureUnit?: MeasureUnit;

  @IsOptional()
  @IsString()
  isChecked?: boolean;
}
