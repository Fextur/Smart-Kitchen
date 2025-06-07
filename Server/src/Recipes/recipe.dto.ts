// Server/src/Recipes/recipe.dto.ts
import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class GenerateRecipeDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsArray()
  sensitivities: string[];

  @IsArray()
  preferences: string[];

  @IsNumber()
  servings: number;

  @IsOptional()
  @IsString()
  searchQuery?: string;
}

export class AskQuestionDto {
  @IsNotEmpty()
  @IsString()
  stepInstruction: string;

  @IsNotEmpty()
  @IsString()
  question: string;

  @IsNumber()
  servings: number;
}

export class SaveRecipeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsArray()
  ingredients: RecipeIngredientDto[];

  @IsArray()
  steps: RecipeStepDto[];

  @IsNumber()
  totalTimeMinutes: number;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsOptional()
  @IsArray()
  missingItems?: KitchenItemDto[];
}

export class ConsumeIngredientsDto {
  @IsNotEmpty()
  @IsString()
  recipeId: string;

  @IsNumber()
  servings: number;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class RecipeIngredientDto {
  @IsOptional()
  @IsUUID()
  productId?: string; // Reference to the actual product

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  baseAmount: number;

  @IsNumber()
  perServingAmount: number;

  @IsNotEmpty()
  @IsString()
  unit: string;
}

export class RecipeStepDto {
  @IsNumber()
  stepNumber: number;

  @IsNotEmpty()
  @IsString()
  instruction: string;

  @IsOptional()
  @IsBoolean()
  isTimerStep?: boolean;

  @IsOptional()
  @IsNumber()
  timerMinutes?: number;
}

export class KitchenItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  size: number;

  @IsNotEmpty()
  @IsString()
  measureUnit: string;

  @IsOptional()
  @IsString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  latestUpdateDate?: string;
}

// Response DTOs
export class RecipeResponseDto {
  id?: string;
  name: string;
  description: string;
  ingredients: RecipeIngredientDto[];
  steps: RecipeStepDto[];
  totalTimeMinutes: number;
  lastAccessedAt?: Date;
  missingItems?: KitchenItemDto[];
}
