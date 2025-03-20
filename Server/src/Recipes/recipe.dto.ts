import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SizeUnit } from 'src/types';

export class GenerateRecipeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  sizeValueLeft: number;

  @IsEnum(SizeUnit)
  @IsNotEmpty()
  sizeUnit: SizeUnit;
}
