import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { MeasureUnit } from 'src/types';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  size: number;

  @IsEnum(MeasureUnit)
  @IsNotEmpty()
  measureUnit: MeasureUnit;

  @IsDate()
  expirationDate: Date;
}

export class CreateProductsDto {
  @IsArray()
  @IsNotEmpty()
  products: ProductDto[];

  @IsNumber()
  @IsNotEmpty()
  inventoryId: string;
}

export class UpdateProductsDto {
  @IsArray()
  @IsNotEmpty()
  products: ProductDto[];

  @IsNumber()
  @IsNotEmpty()
  inventoryId: string;
}
