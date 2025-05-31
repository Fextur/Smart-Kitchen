import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ProductDto } from 'src/Products/product.dto';
import { Preferences } from 'src/types';
import { User } from 'src/Users/user.entity';

export class GenerateRecipeDto {
  @IsNotEmpty()
  userId: User['id'];

  @IsArray()
  sensitivities: User['sensitivities'];

  @IsArray()
  preferences: Preferences[];
}

export class GenerateResDto {
  @IsNotEmpty()
  @IsString()
  recipe: string;

  extraProducts: ProductDto;
}
