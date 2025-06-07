// Server/src/Products/product.dto.ts
import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MeasureUnit } from 'src/types';

export class ProductDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  })
  size: number;

  @IsEnum(MeasureUnit)
  @IsNotEmpty()
  measureUnit: MeasureUnit;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expirationDate?: Date;
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
}
