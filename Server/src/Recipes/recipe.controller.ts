import { Body, Controller, Post } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { GenerateRecipeDto } from './recipe.dto';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post('generate')
  async generate(@Body() generateRecipeDto: GenerateRecipeDto) {
    const { userId, sensitivities, preferences } = generateRecipeDto;
    return this.recipeService.generate(userId, sensitivities, preferences);
  }
}
