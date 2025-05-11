import {
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { SizeUnit } from 'src/types';

export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  sizeValue: number;

  @IsNumber()
  @IsNotEmpty()
  sizeValueLeft: number;
 
  @IsEnum(SizeUnit)
  @IsNotEmpty()
  sizeUnit: SizeUnit;

  @IsDate()
  expirationDate: Date;
}

export class CreateProductsDto {
  @IsArray()
  @IsNotEmpty()
  products: ProductDto[];

  @IsNumber()
  @IsNotEmpty()
  userId: string;
}

export class UpdateProductDto {
  @IsNumber()
  @IsNotEmpty()
  sizeValueLeft: number;
}
