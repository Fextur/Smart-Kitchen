// recipe.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Users/user.entity';
import { Recipe, RecipeHistory } from './recipe.entity';
import {
  GenerateRecipeDto,
  SaveRecipeDto,
  RecipeResponseDto,
  KitchenItemDto,
} from './recipe.dto';
import { cleanOpenAIResponse } from 'src/utils';

@Injectable()
export class RecipeService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(RecipeHistory)
    private recipeHistoryRepository: Repository<RecipeHistory>,
  ) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateRecipe(
    generateRecipeDto: GenerateRecipeDto,
  ): Promise<RecipeResponseDto[]> {
    try {
      const { userId, sensitivities, preferences, servings, searchQuery } =
        generateRecipeDto;

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['inventory', 'inventory.products'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const preferencesString = preferences.join(', ');
      const sensitivitiesString = sensitivities.join(', ');
      const searchQueryString = searchQuery
        ? `המשתמש מחפש: ${searchQuery}.`
        : '';

      const productsString = user.inventory.products
        .map((item) => `${item.size} ${item.measureUnit} של ${item.name}`)
        .join(', ');

      const content = `
        אתה שף מקצועי שיוצר מתכונים מותאמים אישית.
        
        רגישויות: ${sensitivitiesString || 'אין'}.
        המצרכים במלאי: ${productsString}.
        מספר מנות מבוקש: ${servings}.
        העדפות: ${preferencesString || 'אין'}.
        ${searchQueryString}
        
        צור בדיוק 2 מתכונים שונים בפורמט JSON הבא:
        [
          {
            "name": "שם המתכון",
            "description": "תיאור קצר של המנה (עד 20 מילים)",
            "totalTimeMinutes": מספר הדקות הכולל,
            "ingredients": [
              {
                "name": "שם המצרך",
                "baseAmount": כמות בסיס (למתכון מינימלי),
                "perServingAmount": כמות נוספת לכל מנה,
                "unit": "יחידת מידה"
              }
            ],
            "steps": [
              {
                "stepNumber": 1,
                "instruction": "הוראה קצרה וברורה (עד 15 מילים)",
                "isTimerStep": false/true,
                "timerMinutes": מספר דקות (רק אם isTimerStep הוא true)
              }
            ]
          }
        ]
        
        חוקים חשובים:
        1. baseAmount = הכמות המינימלית הנדרשת (למשל: 1 בצל בסיס)
        2. perServingAmount = כמות נוספת לכל מנה (למשל: 0.5 בצל לכל מנה נוספת)
        3. הוראות חייבות להיות קצרות מאוד - עד 15 מילים
        4. סמן isTimerStep=true רק כאשר יש זמן המתנה/בישול/אפייה ספציפי
        5. השתמש במצרכים מהמלאי ככל האפשר
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content }],
        max_tokens: 1500,
        temperature: 0.7,
      });

      const resContentRaw = response.choices[0].message?.content?.trim();
      if (!resContentRaw) throw new Error('Failed to generate recipes');

      const resContent = cleanOpenAIResponse(resContentRaw);
      const generatedRecipes = JSON.parse(resContent);

      const recipesWithInventoryStatus = generatedRecipes.map((recipe: any) => {
        const missingItems: KitchenItemDto[] = [];

        recipe.ingredients.forEach((ingredient: any) => {
          const requiredAmount =
            ingredient.baseAmount + ingredient.perServingAmount * servings;
          const inventoryItem = user.inventory.products.find(
            (p) => p.name.toLowerCase() === ingredient.name.toLowerCase(),
          );

          const availableAmount = inventoryItem?.size || 0;
          if (availableAmount < requiredAmount) {
            missingItems.push({
              name: ingredient.name,
              size: requiredAmount - availableAmount,
              measureUnit: ingredient.unit,
            });
          }
        });

        return {
          ...recipe,
          missingItems: missingItems.length > 0 ? missingItems : undefined,
        };
      });

      return recipesWithInventoryStatus;
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw new HttpException(
        'Failed to generate recipes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async askQuestion(
    stepInstruction: string,
    question: string,
    servings: number,
  ): Promise<string> {
    const content = `
      אתה עוזר בישול מקצועי. המשתמש נמצא בשלב: "${stepInstruction}"
      מכין ${servings} מנות.
      שאלה: ${question}
      
      תן תשובה קצרה וברורה (עד 40 מילים) שתעזור למשתמש להמשיך בבישול.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'system', content }],
        max_tokens: 150,
        temperature: 0.5,
      });

      return (
        response.choices[0].message?.content?.trim() ||
        'מצטער, לא הצלחתי להבין. אנא נסה לנסח את השאלה אחרת.'
      );
    } catch (error) {
      console.error('Question answering error:', error);
      return 'מצטער, אירעה שגיאה טכנית. נסה שוב בעוד רגע.';
    }
  }

  async getUserRecipeHistory(userId: string): Promise<RecipeResponseDto[]> {
    try {
      const recipeHistories = await this.recipeHistoryRepository.find({
        where: { user: { id: userId } },
        relations: ['recipe'],
        order: { accessedAt: 'DESC' },
        take: 10,
      });

      return recipeHistories.map((history) => ({
        id: history.recipe.id,
        name: history.recipe.name,
        description: history.recipe.description,
        ingredients: history.recipe.ingredients,
        steps: history.recipe.steps,
        totalTimeMinutes: history.recipe.totalTimeMinutes,
        lastAccessedAt: history.accessedAt,
      }));
    } catch (error) {
      console.error('Get user recipe history error:', error);
      throw new HttpException(
        'Failed to get recipe history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveRecipe(saveRecipeDto: SaveRecipeDto): Promise<RecipeResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id: saveRecipeDto.userId },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const recipe = this.recipeRepository.create({
        id: saveRecipeDto.id,
        name: saveRecipeDto.name,
        description: saveRecipeDto.description,
        ingredients: saveRecipeDto.ingredients,
        steps: saveRecipeDto.steps,
        totalTimeMinutes: saveRecipeDto.totalTimeMinutes,
        user,
      });

      const savedRecipe = await this.recipeRepository.save(recipe);

      const recipeHistory = this.recipeHistoryRepository.create({
        recipe: savedRecipe,
        user,
        servingsUsed: 0,
        completed: false,
        addedMissingToShoppingList: false,
      });

      await this.recipeHistoryRepository.save(recipeHistory);

      return {
        id: savedRecipe.id,
        name: savedRecipe.name,
        description: savedRecipe.description,
        ingredients: savedRecipe.ingredients,
        steps: savedRecipe.steps,
        totalTimeMinutes: savedRecipe.totalTimeMinutes,
        missingItems: saveRecipeDto.missingItems,
      };
    } catch (error) {
      console.error('Save recipe error:', error);
      throw new HttpException(
        'Failed to save recipe',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
