import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MeasureUnit } from 'src/types';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number) // Ensure it's transformed to a number
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num; // Default to 0 if NaN
  })
  size: number;

  @IsEnum(MeasureUnit)
  @IsNotEmpty()
  measureUnit: MeasureUnit;

  @IsDate()
  @Type(() => Date)
  expirationDate: Date;
}

export class CreateProductsDto {
  @IsArray()
  @IsNotEmpty()
  @Type(() => ProductDto)
  products: ProductDto[];

  @IsString()
  @IsNotEmpty()
  inventoryId: string;
}

export class UpdateProductsDto {
  @IsArray()
  @IsNotEmpty()
  @Type(() => ProductDto)
  products: ProductDto[];

  @IsString()
  @IsNotEmpty()
  inventoryId: string;
}
