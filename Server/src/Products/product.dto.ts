import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { SizeUnit } from 'src/types';

export class CreateProductDto {
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
  @IsNotEmpty()
  expirationDate: Date;

  @IsNumber()
  @IsNotEmpty()
  userId: string;
}

export class UpdateProductDto {
  @IsNumber()
  @IsNotEmpty()
  sizeValueLeft: number;
}
