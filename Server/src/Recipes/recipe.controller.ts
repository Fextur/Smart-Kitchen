// recipe.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import {
  GenerateRecipeDto,
  AskQuestionDto,
  SaveRecipeDto,
  RecipeResponseDto,
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
}
