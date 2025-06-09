import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Users/user.entity';
import { Recipe } from './recipe.entity';
import { Product } from 'src/Products/product.entity';
import { ProductMatchingService } from 'src/ProductMatching/productMatching.service';
import { UnitConverter } from 'src/utils/unitConversion';
import {
  GenerateRecipeDto,
  SaveRecipeDto,
  RecipeResponseDto,
  KitchenItemDto,
  ConsumeIngredientsDto,
} from './recipe.dto';
import { cleanOpenAIResponse } from 'src/utils';
import { MeasureUnit } from 'src/types';

@Injectable()
export class RecipeService {
  private openai: OpenAI;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productMatchingService: ProductMatchingService,
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

      const allInventoryProducts = user.inventory.products;

      const productsString = allInventoryProducts
        .filter((item) => item.isInInventory && item.size > 0)
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
                "unit": "יחידת מידה - השתמש ביחידות מהמלאי אם אפשר!"
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
        6. **שים לב ליחידות המידה במלאי וניסה להשתמש באותן יחידות**
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

      const recipesWithInventoryStatus = await Promise.all(
        generatedRecipes.map(async (recipe: any) => {
          const processedIngredients: Array<{
            name: string;
            baseAmount: number;
            perServingAmount: number;
            unit: string;
            productId?: string;
          }> = [];
          const missingItems: KitchenItemDto[] = [];

          for (const ingredient of recipe.ingredients) {
            const requiredAmount =
              ingredient.baseAmount + ingredient.perServingAmount * servings;

            const { matchedProduct, standardizedIngredient } =
              await this.matchAndStandardizeIngredient(
                ingredient,
                allInventoryProducts,
                user.inventory.id,
              );

            let productId: string | undefined;
            let availableAmount = 0;

            if (matchedProduct) {
              productId = matchedProduct.id;

              const conversionResult = UnitConverter.convertUnits(
                matchedProduct.size || 0,
                matchedProduct.measureUnit,
                this.mapStringToMeasureUnit(standardizedIngredient.unit),
                matchedProduct.name,
              );

              availableAmount = conversionResult.success
                ? conversionResult.convertedSize
                : matchedProduct.size || 0;
            }

            processedIngredients.push({
              ...standardizedIngredient,
              productId,
            });

            const requiredAmountStandardized =
              standardizedIngredient.baseAmount +
              standardizedIngredient.perServingAmount * servings;

            if (availableAmount < requiredAmountStandardized) {
              missingItems.push({
                name: standardizedIngredient.name,
                size: requiredAmountStandardized - availableAmount,
                measureUnit: standardizedIngredient.unit,
              });
            }
          }

          return {
            ...recipe,
            ingredients: processedIngredients,
            missingItems: missingItems.length > 0 ? missingItems : undefined,
          };
        }),
      );

      return recipesWithInventoryStatus;
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw new HttpException(
        'Failed to generate recipes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async matchAndStandardizeIngredient(
    ingredient: any,
    inventoryProducts: Product[],
    inventoryId: string,
  ): Promise<{
    matchedProduct: Product | null;
    standardizedIngredient: any;
  }> {
    const matchingResult =
      await this.productMatchingService.findMatchingProducts(
        [ingredient.name],
        inventoryId,
        inventoryProducts,
      );

    const match = matchingResult.matches[0];
    let matchedProduct: Product | null = null;
    let standardizedIngredient = { ...ingredient };

    if (
      match.matchedProduct &&
      (match.confidence === 'high' || match.confidence === 'medium')
    ) {
      matchedProduct = match.matchedProduct;

      const ingredientUnit = this.mapStringToMeasureUnit(ingredient.unit);
      const areCompatible = UnitConverter.areUnitsCompatible(
        ingredientUnit,
        matchedProduct.measureUnit,
        ingredient.name,
      );

      if (areCompatible) {
        const baseConversion = UnitConverter.convertUnits(
          ingredient.baseAmount,
          ingredientUnit,
          matchedProduct.measureUnit,
          ingredient.name,
        );

        const perServingConversion = UnitConverter.convertUnits(
          ingredient.perServingAmount,
          ingredientUnit,
          matchedProduct.measureUnit,
          ingredient.name,
        );

        if (baseConversion.success && perServingConversion.success) {
          standardizedIngredient = {
            ...ingredient,
            baseAmount: baseConversion.convertedSize,
            perServingAmount: perServingConversion.convertedSize,
            unit: matchedProduct.measureUnit,
          };
        }
      }
    }

    return {
      matchedProduct,
      standardizedIngredient,
    };
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
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      const recipes = await this.recipeRepository
        .createQueryBuilder('recipe')
        .where('recipe.userId = :userId', { userId })
        .andWhere('recipe.lastAccessedAt IS NOT NULL')
        .andWhere('recipe.lastAccessedAt >= :twoWeeksAgo', { twoWeeksAgo })
        .orderBy('recipe.lastAccessedAt', 'DESC')
        .limit(10)
        .getMany();

      if (recipes.length === 0) {
        return [];
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['inventory', 'inventory.products'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const inventoryProducts = user.inventory.products.filter(
        (item) => item.isInInventory && item.size > 0,
      );

      const recipesWithMissingItems = recipes.map((recipe) => {
        const missingItems: KitchenItemDto[] = [];
        const defaultServings = 2;

        for (const ingredient of recipe.ingredients) {
          const requiredAmount =
            ingredient.baseAmount +
            ingredient.perServingAmount * defaultServings;

          let availableAmount = 0;

          if (ingredient.productId) {
            const product = inventoryProducts.find(
              (p) => p.id === ingredient.productId,
            );

            if (product) {
              const conversionResult = UnitConverter.convertUnits(
                product.size || 0,
                product.measureUnit,
                this.mapStringToMeasureUnit(ingredient.unit),
                product.name,
              );

              availableAmount = conversionResult.success
                ? conversionResult.convertedSize
                : product.size || 0;
            }
          }

          if (availableAmount < requiredAmount) {
            missingItems.push({
              name: ingredient.name,
              size: requiredAmount - availableAmount,
              measureUnit: ingredient.unit,
            });
          }
        }

        return {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          totalTimeMinutes: recipe.totalTimeMinutes,
          lastAccessedAt: recipe.lastAccessedAt,
          missingItems: missingItems.length > 0 ? missingItems : undefined,
        };
      });

      return recipesWithMissingItems;
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
        relations: ['inventory'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const processedIngredients = await this.processRecipeIngredients(
        saveRecipeDto.ingredients,
        user.inventory.id,
      );

      const recipeData: any = {
        name: saveRecipeDto.name,
        description: saveRecipeDto.description,
        ingredients: processedIngredients,
        steps: saveRecipeDto.steps,
        totalTimeMinutes: saveRecipeDto.totalTimeMinutes,
        user,
        lastAccessedAt: new Date(),
      };

      if (saveRecipeDto.id && this.isValidUUID(saveRecipeDto.id)) {
        recipeData.id = saveRecipeDto.id;
      }

      const recipe = this.recipeRepository.create(recipeData);
      const savedRecipe = await this.recipeRepository.save(recipe);

      const recipeEntity = Array.isArray(savedRecipe)
        ? savedRecipe[0]
        : savedRecipe;

      return {
        id: recipeEntity.id,
        name: recipeEntity.name,
        description: recipeEntity.description,
        ingredients: recipeEntity.ingredients,
        steps: recipeEntity.steps,
        totalTimeMinutes: recipeEntity.totalTimeMinutes,
        lastAccessedAt: recipeEntity.lastAccessedAt,
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

  private async processRecipeIngredients(
    ingredients: any[],
    inventoryId: string,
  ): Promise<any[]> {
    const processedIngredients: any[] = [];

    for (const ingredient of ingredients) {
      if (ingredient.productId) {
        processedIngredients.push(ingredient);
        continue;
      }

      const newProduct = this.productRepository.create({
        name: ingredient.name,
        size: 0,
        wantedSize: 0,
        measureUnit: this.validateMeasureUnit(ingredient.unit),
        latestUpdateDate: new Date(),
        isInInventory: false,
        isInShoppingList: false,
        isChecked: false,
        inventory: { id: inventoryId },
      });

      const savedProduct = await this.productRepository.save(newProduct);

      processedIngredients.push({
        ...ingredient,
        productId: savedProduct.id,
      });
    }

    return processedIngredients;
  }

  private validateMeasureUnit(unit: string): MeasureUnit {
    const unitMappings = {
      גרם: MeasureUnit.GRAM,
      קילוגרם: MeasureUnit.KILOGRAM,
      'ק״ג': MeasureUnit.KILOGRAM,
      ליטר: MeasureUnit.LITER,
      'ל׳': MeasureUnit.LITER,
      מיליליטר: MeasureUnit.MILLILITER,
      'מ״ל': MeasureUnit.MILLILITER,
      יחידות: MeasureUnit.UNIT,
    };

    return unitMappings[unit] || MeasureUnit.UNIT;
  }

  async consumeIngredients(
    consumeDto: ConsumeIngredientsDto,
  ): Promise<{ message: string; updatedProducts: Product[] }> {
    try {
      const { recipeId, servings, userId } = consumeDto;

      const recipe = await this.recipeRepository.findOne({
        where: { id: recipeId },
        relations: ['user'],
      });

      if (!recipe) {
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      }

      if (recipe.user.id !== userId) {
        throw new HttpException(
          'Unauthorized access to recipe',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const updatedProducts: Product[] = [];

      for (const ingredient of recipe.ingredients) {
        if (ingredient.productId) {
          const product = await this.productRepository.findOne({
            where: { id: ingredient.productId },
          });

          if (product && product.isInInventory && product.size > 0) {
            const amountToConsume =
              ingredient.baseAmount + ingredient.perServingAmount * servings;

            const ingredientUnit = this.mapStringToMeasureUnit(ingredient.unit);
            const conversionResult = UnitConverter.convertUnits(
              amountToConsume,
              ingredientUnit,
              product.measureUnit,
              product.name,
            );

            const consumeInProductUnit = conversionResult.success
              ? conversionResult.convertedSize
              : amountToConsume;

            const newSize = Math.max(0, product.size - consumeInProductUnit);
            product.size = newSize;
            product.latestUpdateDate = new Date();

            const updatedProduct = await this.productRepository.save(product);
            updatedProducts.push(updatedProduct);
          }
        }
      }

      recipe.lastAccessedAt = new Date();
      await this.recipeRepository.save(recipe);

      return {
        message: `Successfully consumed ingredients for ${servings} servings`,
        updatedProducts,
      };
    } catch (error) {
      console.error('Consume ingredients error:', error);
      throw new HttpException(
        'Failed to consume ingredients',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addMissingItemsToShoppingList(
    recipeId: string,
    userId: string,
    servings: number,
  ): Promise<{ message: string }> {
    try {
      const recipe = await this.recipeRepository.findOne({
        where: { id: recipeId },
        relations: ['user'],
      });

      if (!recipe) {
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      }

      if (recipe.user.id !== userId) {
        throw new HttpException(
          'Unauthorized access to recipe',
          HttpStatus.UNAUTHORIZED,
        );
      }

      for (const ingredient of recipe.ingredients) {
        if (!ingredient.productId) {
          continue;
        }

        const requiredAmount =
          ingredient.baseAmount + ingredient.perServingAmount * servings;

        const product = await this.productRepository.findOne({
          where: { id: ingredient.productId },
        });

        if (product) {
          const currentAmount = product.isInInventory ? product.size || 0 : 0;

          const ingredientUnit = this.mapStringToMeasureUnit(ingredient.unit);
          const conversionResult = UnitConverter.convertUnits(
            currentAmount,
            product.measureUnit,
            ingredientUnit,
            product.name,
          );

          const availableInIngredientUnit = conversionResult.success
            ? conversionResult.convertedSize
            : currentAmount;

          const missingAmount = Math.max(
            0,
            requiredAmount - availableInIngredientUnit,
          );

          if (missingAmount > 0) {
            const shoppingListConversion = UnitConverter.convertUnits(
              missingAmount,
              ingredientUnit,
              product.measureUnit,
              product.name,
            );

            const missingInProductUnit = shoppingListConversion.success
              ? shoppingListConversion.convertedSize
              : missingAmount;

            product.wantedSize =
              (product.wantedSize || 0) + missingInProductUnit;
            product.isInShoppingList = true;
            await this.productRepository.save(product);
          }
        }
      }

      recipe.lastAccessedAt = new Date();
      await this.recipeRepository.save(recipe);

      return {
        message: 'Missing ingredients added to shopping list successfully',
      };
    } catch (error) {
      console.error('Add missing items to shopping list error:', error);
      throw new HttpException(
        'Failed to add missing items to shopping list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async recalculateMissingItems(
    recipeId: string,
    servings: number,
  ): Promise<KitchenItemDto[]> {
    try {
      const recipe = await this.recipeRepository.findOne({
        where: { id: recipeId },
        relations: ['user', 'user.inventory', 'user.inventory.products'],
      });

      if (!recipe) {
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      }

      const missingItems: KitchenItemDto[] = [];
      const inventoryProducts = recipe.user.inventory.products.filter(
        (item) => item.isInInventory && item.size > 0,
      );

      for (const ingredient of recipe.ingredients) {
        const requiredAmount =
          ingredient.baseAmount + ingredient.perServingAmount * servings;

        let availableAmount = 0;
        if (ingredient.productId) {
          const product = inventoryProducts.find(
            (p) => p.id === ingredient.productId,
          );

          if (product) {
            const conversionResult = UnitConverter.convertUnits(
              product.size || 0,
              product.measureUnit,
              this.mapStringToMeasureUnit(ingredient.unit),
              product.name,
            );

            availableAmount = conversionResult.success
              ? conversionResult.convertedSize
              : product.size || 0;
          }
        }

        if (availableAmount < requiredAmount) {
          missingItems.push({
            name: ingredient.name,
            size: requiredAmount - availableAmount,
            measureUnit: ingredient.unit,
          });
        }
      }

      return missingItems;
    } catch (error) {
      console.error('Recalculate missing items error:', error);
      throw new HttpException(
        'Failed to recalculate missing items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRecipeWithMissingItems(
    recipeId: string,
    servings: number,
  ): Promise<RecipeResponseDto> {
    try {
      const recipe = await this.recipeRepository.findOne({
        where: { id: recipeId },
        relations: ['user', 'user.inventory', 'user.inventory.products'],
      });

      if (!recipe) {
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      }

      const missingItems = await this.recalculateMissingItems(
        recipeId,
        servings,
      );

      return {
        id: recipe.id,
        name: recipe.name,
        description: recipe.description,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        totalTimeMinutes: recipe.totalTimeMinutes,
        lastAccessedAt: recipe.lastAccessedAt,
        missingItems: missingItems.length > 0 ? missingItems : undefined,
      };
    } catch (error) {
      console.error('Get recipe with missing items error:', error);
      throw new HttpException(
        'Failed to get recipe with missing items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  private mapStringToMeasureUnit(unit: string): MeasureUnit {
    const unitMappings = {
      גרם: MeasureUnit.GRAM,
      קילוגרם: MeasureUnit.KILOGRAM,
      'ק״ג': MeasureUnit.KILOGRAM,
      kg: MeasureUnit.KILOGRAM,
      ליטר: MeasureUnit.LITER,
      'ל׳': MeasureUnit.LITER,
      l: MeasureUnit.LITER,
      מיליליטר: MeasureUnit.MILLILITER,
      'מ״ל': MeasureUnit.MILLILITER,
      ml: MeasureUnit.MILLILITER,
      יחידות: MeasureUnit.UNIT,
      יח: MeasureUnit.UNIT,
      unit: MeasureUnit.UNIT,
    };

    return unitMappings[unit.toLowerCase()] || MeasureUnit.UNIT;
  }
}
