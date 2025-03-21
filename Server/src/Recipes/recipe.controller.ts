import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { GenerateRecipeDto } from './recipe.dto';

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  async generate(@Body() products: GenerateRecipeDto[]) {
    return this.recipeService.generate(products);
  }
}
