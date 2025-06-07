// Server/src/Recipes/recipe.service.ts
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/Users/user.entity';
import { Recipe } from './recipe.entity';
import { Product } from 'src/Products/product.entity';
import { ProductMatchingService } from 'src/ProductMatching/productMatching.service';
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

      // Get ALL products from inventory (not just those in inventory)
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

      // Process each recipe to add product IDs and calculate missing items
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

            // Try to find matching product
            const matchingResult =
              await this.productMatchingService.findMatchingProducts(
                [ingredient.name],
                user.inventory.id,
                allInventoryProducts,
              );

            const match = matchingResult.matches[0];
            let productId: string | undefined;
            let availableAmount = 0;

            if (
              match.matchedProduct &&
              (match.confidence === 'high' || match.confidence === 'medium')
            ) {
              productId = match.matchedProduct.id;
              availableAmount = match.matchedProduct.isInInventory
                ? match.matchedProduct.size || 0
                : 0;
            }

            // Add processed ingredient with productId if found
            processedIngredients.push({
              ...ingredient,
              productId,
            });

            // Check if missing
            if (availableAmount < requiredAmount) {
              missingItems.push({
                name: ingredient.name,
                size: requiredAmount - availableAmount,
                measureUnit: ingredient.unit,
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

      // Get user inventory separately to avoid join issues
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['inventory', 'inventory.products'],
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Get products that are actually in inventory with stock
      const inventoryProducts = user.inventory.products.filter(
        (item) => item.isInInventory && item.size > 0,
      );

      // Calculate missing ingredients for each recipe
      const recipesWithMissingItems = recipes.map((recipe, index) => {
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
            availableAmount = product?.size || 0;
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

      console.log(
        `Returning ${recipesWithMissingItems.length} recipes to client`,
      );
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

      // Step 1: Process ingredients and create/find products
      const processedIngredients = await this.processRecipeIngredients(
        saveRecipeDto.ingredients,
        user.inventory.id,
      );

      // Step 2: Create and save the recipe with product IDs
      const recipeData: any = {
        name: saveRecipeDto.name,
        description: saveRecipeDto.description,
        ingredients: processedIngredients,
        steps: saveRecipeDto.steps,
        totalTimeMinutes: saveRecipeDto.totalTimeMinutes,
        user,
        lastAccessedAt: new Date(), // Mark as accessed when saved
      };

      // Only set ID if it's a valid UUID
      if (saveRecipeDto.id && this.isValidUUID(saveRecipeDto.id)) {
        recipeData.id = saveRecipeDto.id;
      }

      const recipe = this.recipeRepository.create(recipeData);

      const savedRecipe = await this.recipeRepository.save(recipe);

      // Ensure savedRecipe is a single entity, not an array
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
        missingItems: saveRecipeDto.missingItems, // Use the original missing items from generation
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
      // If ingredient already has productId from generation, use it
      if (ingredient.productId) {
        processedIngredients.push(ingredient);
        continue;
      }

      // If no productId, create new product
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

      // Find the recipe
      const recipe = await this.recipeRepository.findOne({
        where: { id: recipeId },
        relations: ['user'],
      });

      if (!recipe) {
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      }

      // Verify user owns the recipe (optional, since we're also checking by user)
      if (recipe.user.id !== userId) {
        throw new HttpException(
          'Unauthorized access to recipe',
          HttpStatus.UNAUTHORIZED,
        );
      }

      const updatedProducts: Product[] = [];

      // Process each ingredient
      for (const ingredient of recipe.ingredients) {
        if (ingredient.productId) {
          const product = await this.productRepository.findOne({
            where: { id: ingredient.productId },
          });

          if (product && product.isInInventory && product.size > 0) {
            // Calculate amount to consume
            const amountToConsume =
              ingredient.baseAmount + ingredient.perServingAmount * servings;

            // Decrease the product size
            const newSize = Math.max(0, product.size - amountToConsume);
            product.size = newSize;
            product.latestUpdateDate = new Date();

            const updatedProduct = await this.productRepository.save(product);
            updatedProducts.push(updatedProduct);
          }
        }
      }

      // Update recipe lastAccessedAt
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

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
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

      // Get only products that are actually in inventory with stock
      const inventoryProducts = recipe.user.inventory.products.filter(
        (item) => item.isInInventory && item.size > 0,
      );

      for (const ingredient of recipe.ingredients) {
        const requiredAmount =
          ingredient.baseAmount + ingredient.perServingAmount * servings;

        // Find the actual product for this ingredient
        let availableAmount = 0;
        if (ingredient.productId) {
          const product = inventoryProducts.find(
            (p) => p.id === ingredient.productId,
          );
          availableAmount = product?.size || 0;
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

      const missingItems: KitchenItemDto[] = [];

      // Get only products that are actually in inventory with stock
      const inventoryProducts = recipe.user.inventory.products.filter(
        (item) => item.isInInventory && item.size > 0,
      );

      for (const ingredient of recipe.ingredients) {
        const requiredAmount =
          ingredient.baseAmount + ingredient.perServingAmount * servings;

        // Find the actual product for this ingredient
        let availableAmount = 0;
        if (ingredient.productId) {
          const product = inventoryProducts.find(
            (p) => p.id === ingredient.productId,
          );
          availableAmount = product?.size || 0;
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
    } catch (error) {
      console.error('Get recipe with missing items error:', error);
      throw new HttpException(
        'Failed to get recipe with missing items',
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
      // Find the recipe
      const recipe = await this.recipeRepository.findOne({
        where: { id: recipeId },
        relations: ['user'],
      });

      if (!recipe) {
        throw new HttpException('Recipe not found', HttpStatus.NOT_FOUND);
      }

      // Verify user owns the recipe
      if (recipe.user.id !== userId) {
        throw new HttpException(
          'Unauthorized access to recipe',
          HttpStatus.UNAUTHORIZED,
        );
      }

      // Process each ingredient
      for (const ingredient of recipe.ingredients) {
        if (!ingredient.productId) {
          continue; // Skip ingredients without product IDs
        }

        const requiredAmount =
          ingredient.baseAmount + ingredient.perServingAmount * servings;

        const product = await this.productRepository.findOne({
          where: { id: ingredient.productId },
        });

        if (product) {
          const currentAmount = product.isInInventory ? product.size || 0 : 0;
          const missingAmount = Math.max(0, requiredAmount - currentAmount);

          if (missingAmount > 0) {
            // Add missing amount to shopping list
            product.wantedSize = (product.wantedSize || 0) + missingAmount;
            product.isInShoppingList = true;
            await this.productRepository.save(product);
          }
        }
      }

      // Update recipe lastAccessedAt
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
}
