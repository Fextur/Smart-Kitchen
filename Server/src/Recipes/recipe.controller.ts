import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import {
  GenerateRecipeDto,
  AskQuestionDto,
  SaveRecipeDto,
  RecipeResponseDto,
  ConsumeIngredientsDto,
} from './recipe.dto';

@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post('generate')
  async generateRecipe(
    @Body() generateRecipeDto: GenerateRecipeDto,
  ): Promise<RecipeResponseDto[]> {
    return this.recipeService.generateRecipe(generateRecipeDto);
  }

  @Post('ask-question')
  async askQuestion(
    @Body() askQuestionDto: AskQuestionDto,
  ): Promise<{ answer: string }> {
    const answer = await this.recipeService.askQuestion(
      askQuestionDto.stepInstruction,
      askQuestionDto.question,
      askQuestionDto.servings,
    );
    return { answer };
  }

  @Get('history/:userId')
  async getUserRecipeHistory(
    @Param('userId') userId: string,
  ): Promise<RecipeResponseDto[]> {
    return this.recipeService.getUserRecipeHistory(userId);
  }

  @Post('save')
  async saveRecipe(
    @Body() saveRecipeDto: SaveRecipeDto,
  ): Promise<RecipeResponseDto> {
    return this.recipeService.saveRecipe(saveRecipeDto);
  }

  @Post('consume-ingredients')
  async consumeIngredients(
    @Body() consumeDto: ConsumeIngredientsDto,
  ): Promise<{ message: string; updatedProducts: any[] }> {
    return this.recipeService.consumeIngredients(consumeDto);
  }

  @Post(':recipeId/add-missing-to-shopping-list')
  async addMissingItemsToShoppingList(
    @Param('recipeId') recipeId: string,
    @Body() body: { userId: string; servings: number },
  ): Promise<{ message: string }> {
    return this.recipeService.addMissingItemsToShoppingList(
      recipeId,
      body.userId,
      body.servings,
    );
  }

  @Get(':recipeId/missing-items/:servings')
  async getMissingItems(
    @Param('recipeId') recipeId: string,
    @Param('servings') servings: number,
  ): Promise<{ missingItems: any[] }> {
    const missingItems = await this.recipeService.recalculateMissingItems(
      recipeId,
      servings,
    );
    return { missingItems };
  }

  @Get(':recipeId/with-missing-items/:servings')
  async getRecipeWithMissingItems(
    @Param('recipeId') recipeId: string,
    @Param('servings') servings: number,
  ): Promise<RecipeResponseDto> {
    return this.recipeService.getRecipeWithMissingItems(recipeId, servings);
  }
}
