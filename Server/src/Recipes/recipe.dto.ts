import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { Preferences } from 'src/types';

export class GenerateRecipeDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  preferences: Preferences[];
}
