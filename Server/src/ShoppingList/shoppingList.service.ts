import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from 'src/Products/product.entity';
import { Inventory } from 'src/Inventory/inventory.entity';
import { CreateShoppingListDto } from './shoppingList.dto';
import { ProductMatchingService } from 'src/ProductMatching/productMatching.service';
import { UnitConverter } from 'src/utils/unitConversion';
import { MeasureUnit, AlertType, EventTypes} from 'src/types';
import { AuthenticatedUser } from 'src/Auth/current-user.decorator';
import { getEventNameFromType } from 'src/utils/eventUtils';


export interface ShoppingListResult {
  updatedProducts: Product[];
  createdProducts: Product[];
  matchingResults: Array<{
    productName: string;
    action: 'updated' | 'created';
    matchedWith?: string;
    confidence?: string;
    unitConversionApplied?: boolean;
    originalUnit?: string;
    finalUnit?: string;
  }>;
}

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,

    private productMatchingService: ProductMatchingService,

    private eventEmitter: EventEmitter2, // Add EventEmitter2 for events
  ) {}
  async addProductsToShoppingList(
    createShoppingListDto: CreateShoppingListDto,
    user: AuthenticatedUser, // Add user parameter
  ): Promise<ShoppingListResult> {
    const { inventoryId, products } = createShoppingListDto;

    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory with id ${inventoryId} not found`);
    }

    const updatedProducts: Product[] = [];
    const createdProducts: Product[] = [];
    const matchingResults: Array<{
      productName: string;
      action: 'updated' | 'created';
      matchedWith?: string;
      confidence?: string;
      unitConversionApplied?: boolean;
      originalUnit?: string;
      finalUnit?: string;
    }> = [];

    const productsWithIds = products.filter((p) => p.id);
    const productsWithoutIds = products.filter((p) => !p.id);

    for (const productDto of productsWithIds) {
      const existingProduct = await this.productRepository.findOne({
        where: { id: productDto.id },
        relations: ['inventory'],
      });

      if (!existingProduct) {
        throw new NotFoundException(
          `Product with id ${productDto.id} not found`,
        );
      }

      const areCompatible = UnitConverter.areUnitsCompatible(
        existingProduct.measureUnit,
        productDto.measureUnit,
        existingProduct.name,
      );

      if (areCompatible) {
        const mergeResult = UnitConverter.mergeQuantities(
          existingProduct.wantedSize || 0,
          existingProduct.measureUnit,
          productDto.size,
          productDto.measureUnit,
          existingProduct.name,
        );        existingProduct.wantedSize = mergeResult.size;
        existingProduct.isInShoppingList = true;
        existingProduct.latestUpdateDate = new Date();

        const savedProduct = await this.productRepository.save(existingProduct);
        console.log(`[ShoppingList] Updated product ${savedProduct.name} - isInShoppingList: ${savedProduct.isInShoppingList}`);
        updatedProducts.push(savedProduct);

        matchingResults.push({
          productName: productDto.name,
          action: 'updated',
          matchedWith: existingProduct.name,
          unitConversionApplied: mergeResult.converted,
          originalUnit: productDto.measureUnit,
          finalUnit: existingProduct.measureUnit,
        });
      } else {
        const newProduct = this.productRepository.create({
          name: `${productDto.name} (${productDto.measureUnit})`,
          size: 0,
          wantedSize: productDto.size,
          measureUnit: productDto.measureUnit,
          expirationDate: productDto.expirationDate,
          latestUpdateDate: new Date(),
          isInShoppingList: true,
          isInInventory: false,
          isChecked: false,
          inventory,
        });

        const savedProduct = await this.productRepository.save(newProduct);
        createdProducts.push(savedProduct);

        matchingResults.push({
          productName: productDto.name,
          action: 'created',
          unitConversionApplied: false,
          originalUnit: productDto.measureUnit,
          finalUnit: productDto.measureUnit,
        });
      }
    }

    if (productsWithoutIds.length > 0) {
      const productNames = productsWithoutIds.map((p) => p.name);

      const matchingResult =
        await this.productMatchingService.findMatchingProducts(
          productNames,
          inventoryId,
        );

      for (let i = 0; i < productsWithoutIds.length; i++) {
        const productDto = productsWithoutIds[i];
        const match = matchingResult.matches[i];

        if (
          match.matchedProduct &&
          (match.confidence === 'high' || match.confidence === 'medium')
        ) {
          const areCompatible = UnitConverter.areUnitsCompatible(
            match.matchedProduct.measureUnit,
            productDto.measureUnit,
            match.matchedProduct.name,
          );

          if (areCompatible) {
            const mergeResult = UnitConverter.mergeQuantities(
              match.matchedProduct.wantedSize || 0,
              match.matchedProduct.measureUnit,
              productDto.size,
              productDto.measureUnit,
              match.matchedProduct.name,
            );

            match.matchedProduct.wantedSize = mergeResult.size;
            match.matchedProduct.isInShoppingList = true;
            match.matchedProduct.latestUpdateDate = new Date();

            const savedProduct = await this.productRepository.save(
              match.matchedProduct,
            );
            updatedProducts.push(savedProduct);

            matchingResults.push({
              productName: productDto.name,
              action: 'updated',
              matchedWith: match.matchedProduct.name,
              confidence: match.confidence,
              unitConversionApplied: mergeResult.converted,
              originalUnit: productDto.measureUnit,
              finalUnit: match.matchedProduct.measureUnit,
            });
          } else {
            const newProduct = this.productRepository.create({
              name: productDto.name,
              size: 0,
              wantedSize: productDto.size,
              measureUnit: productDto.measureUnit,
              expirationDate: productDto.expirationDate,
              latestUpdateDate: new Date(),
              isInShoppingList: true,
              isInInventory: false,
              isChecked: false,
              inventory,
            });

            const savedProduct = await this.productRepository.save(newProduct);
            createdProducts.push(savedProduct);

            matchingResults.push({
              productName: productDto.name,
              action: 'created',
              unitConversionApplied: false,
              originalUnit: productDto.measureUnit,
              finalUnit: productDto.measureUnit,
            });
          }
        } else {
          const newProduct = this.productRepository.create({
            name: productDto.name,
            size: 0,
            wantedSize: productDto.size,
            measureUnit: productDto.measureUnit,
            expirationDate: productDto.expirationDate,
            latestUpdateDate: new Date(),
            isInShoppingList: true,
            isInInventory: false,
            isChecked: false,
            inventory,
          });

          const savedProduct = await this.productRepository.save(newProduct);
          createdProducts.push(savedProduct);

          matchingResults.push({
            productName: productDto.name,
            action: 'created',
            unitConversionApplied: false,
            originalUnit: productDto.measureUnit,
            finalUnit: productDto.measureUnit,
          });
        }      }
    }

    // Emit ADD_TO_SHOPPING_LIST event for all products added
    if (createdProducts.length > 0 || updatedProducts.length > 0) {
      const totalProductsAdded = createdProducts.length + updatedProducts.length;
      
      // Log the final state of all products
      console.log(`[ShoppingList] Final state check:`);
      [...createdProducts, ...updatedProducts].forEach(product => {
        console.log(`  Product: ${product.name}, isInShoppingList: ${product.isInShoppingList}, wantedSize: ${product.wantedSize}`);
      });
        const productNames = [
        ...createdProducts.map(p => p.name),
        ...updatedProducts.map(p => p.name)
      ].join(', ');

      this.eventEmitter.emit(EventTypes.ADD_TO_SHOPPING_LIST, {
        type: AlertType.ADD_TO_SHOPPING_LIST,
        userId: user.id,
        metadata: {
          itemCount: totalProductsAdded,
          itemName: productNames,
          inventoryId,
          userName: user.userName,
        },
        broadcastToUserInventory: true, // Notify all users in the kitchen
      });

      console.log(`[ShoppingListService] Emitted ADD_TO_SHOPPING_LIST event for user ${user.id} (${user.userName})`);
    }

    return {
      updatedProducts,
      createdProducts,
      matchingResults,
    };
  }  async transferProductsToInventory(inventoryId: string, userId?: string): Promise<void> {
    const shoppingListProducts = await this.productRepository.find({
      where: {
        inventory: { id: inventoryId },
        isInShoppingList: true,
      },
    });

    if (shoppingListProducts.length === 0) {
      throw new NotFoundException(
        `No products found in shopping list for inventory ID ${inventoryId}`,
      );
    }

    for (const product of shoppingListProducts) {
      if (product.wantedSize) {
        product.size = (product.size || 0) + product.wantedSize;
        product.wantedSize = 0;
      }

      product.isInInventory = true;
      product.isInShoppingList = false;
      product.isChecked = false;
      product.latestUpdateDate = new Date();

      await this.productRepository.save(product);      // Emit event for each transferred item if userId provided
      if (userId) {
        console.log(`[ShoppingListService] Product "${product.name}" transferred to kitchen, emitting EDIT_SHOPPING_LIST event for userId: ${userId}`);
        
        this.eventEmitter.emit(EventTypes.EDIT_SHOPPING_LIST, {
          type: AlertType.EDIT_SHOPPING_LIST,
          userId,
          metadata: {
            action: 'transferred-shopping-to-kitchen',
            itemName: product.name
          },
          broadcastToUserInventory: true,
        });
      }
    }
  }
  async transferProductsToShoppingList(
    inventoryId: string,
    product: Product,
    user: AuthenticatedUser, // Add user parameter
  ): Promise<void> {
    const existingProduct = await this.productRepository.findOne({
      where: { id: product.id, inventory: { id: inventoryId } },
    });

    if (!existingProduct) {
      throw new NotFoundException(
        `Product with id ${product.id} not found in inventory ${inventoryId}`,
      );
    }

    existingProduct.wantedSize =
      (existingProduct.wantedSize || 0) + (product.size || 0);
    existingProduct.size = Math.max(
      0,
      (existingProduct.size || 0) - (product.size || 0),
    );    existingProduct.isInShoppingList = true;
    existingProduct.latestUpdateDate = new Date();    await this.productRepository.save(existingProduct);

    // Emit EDIT_SHOPPING_LIST event for transferred product
    this.eventEmitter.emit(EventTypes.EDIT_SHOPPING_LIST, {
      type: AlertType.EDIT_SHOPPING_LIST,
      userId: user.id,
      metadata: {
        itemName: existingProduct.name,
        wantedSize: existingProduct.wantedSize,
        inventoryId,
        userName: user.userName,
        action: 'transferred_to_shopping_list',
      },
      broadcastToUserInventory: true, // Notify all users in the kitchen
    });

    console.log(`[ShoppingListService] Emitted EDIT_SHOPPING_LIST event for transferred product: ${existingProduct.name}`);
  }

  async clearShoppingList(inventoryId: string, user: AuthenticatedUser): Promise<void> {
    const shoppingListProducts = await this.productRepository.find({
      where: {
        inventory: { id: inventoryId },
        isInShoppingList: true,
      },    });

    // Collect product names before clearing
    const productNames = shoppingListProducts.map(p => p.name);

    for (const product of shoppingListProducts) {
      product.isInShoppingList = false;
      product.wantedSize = 0;
      product.isChecked = false;
      await this.productRepository.save(product);
    }

    // Emit EDIT_SHOPPING_LIST event for clearing shopping list
    if (shoppingListProducts.length > 0) {
      this.eventEmitter.emit(EventTypes.EDIT_SHOPPING_LIST, {
        type: AlertType.EDIT_SHOPPING_LIST,
        userId: user.id,
        metadata: {
          action: 'cleared',
          itemCount: shoppingListProducts.length,
          itemNames: productNames.join(', '), // Add item names
          inventoryId,
          userName: user.userName,
        },
        broadcastToUserInventory: true, // Notify all users in the kitchen
      });

      console.log(`[ShoppingListService] Emitted EDIT_SHOPPING_LIST event for clearing ${shoppingListProducts.length} items`);
    }
  }
  async updateProductInShoppingList(
    productId: string,
    updates: Partial<{
      wantedSize: number;
      isChecked: boolean;
      name: string;
      measureUnit: string;
    }>,
    user: AuthenticatedUser, // Add user parameter
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId, isInShoppingList: true },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with id ${productId} not found in shopping list`,
      );
    }

    if (updates.measureUnit && updates.measureUnit !== product.measureUnit) {
      const newUnit = this.mapStringToMeasureUnit(updates.measureUnit);
      const areCompatible = UnitConverter.areUnitsCompatible(
        product.measureUnit,
        newUnit,
        product.name,
      );

      if (areCompatible) {
        const conversionResult = UnitConverter.convertUnits(
          product.wantedSize || 0,
          product.measureUnit,
          newUnit,
          product.name,
        );

        if (conversionResult.success) {
          product.wantedSize = conversionResult.convertedSize;
          product.measureUnit = newUnit;
        }
      } else {
        console.warn(
          `Cannot convert shopping list units for ${product.name}: ` +
            `${product.measureUnit} -> ${newUnit}`,
        );
        delete updates.measureUnit;
      }
    }    Object.assign(product, updates);
    product.latestUpdateDate = new Date();

    const updatedProduct = await this.productRepository.save(product);

    // Emit EDIT_SHOPPING_LIST event for product update
    this.eventEmitter.emit(EventTypes.EDIT_SHOPPING_LIST, {
      type: AlertType.EDIT_SHOPPING_LIST,
      userId: user.id,
      metadata: {
        itemName: updatedProduct.name,
        action: 'updated',
        updates: Object.keys(updates),
        inventoryId: updatedProduct.inventory?.id,
        userName: user.userName,
      },
      broadcastToUserInventory: true, // Notify all users in the kitchen
    });

    console.log(`[ShoppingListService] Emitted EDIT_SHOPPING_LIST event for updated product: ${updatedProduct.name}`);

    return updatedProduct;
  }
  async removeProductFromShoppingList(productId: string, user: AuthenticatedUser): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId, isInShoppingList: true },
      relations: ['inventory'], // Ensure inventory is loaded
    });

    console.log(`[ShoppingListService] Attempting to remove product with ID: ${productId}`);
    console.log(`[ShoppingListService] Product found:`, product ? {
      id: product.id,
      name: product.name,
      isInShoppingList: product.isInShoppingList,
      inventoryId: product.inventory?.id
    } : null);

    if (!product) {
      throw new NotFoundException(
        `Product with id ${productId} not found in shopping list`,
      );
    }

    product.isInShoppingList = false;
    product.wantedSize = 0;
    product.isChecked = false;
    await this.productRepository.save(product);

    console.log(`[ShoppingListService] About to emit EDIT_SHOPPING_LIST event for removed product: ${product.name}`);

    // Emit EDIT_SHOPPING_LIST event for product removal
    this.eventEmitter.emit(EventTypes.EDIT_SHOPPING_LIST, {
      type: AlertType.EDIT_SHOPPING_LIST,
      userId: user.id,
      metadata: {
        itemName: product.name,
        action: 'removed-from-shopping-list',
        inventoryId: product.inventory?.id,
        userName: user.userName,
      },
      broadcastToUserInventory: true, // Notify all users in the kitchen
    });

    console.log(`[ShoppingListService] Emitted EDIT_SHOPPING_LIST event for removed product: ${product.name}`);
  }

  private mapStringToMeasureUnit(unit: string): MeasureUnit {
    const unitMappings = {
      גרם: MeasureUnit.GRAM,
      'גר׳': MeasureUnit.GRAM,
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

  async consolidateShoppingListUnits(inventoryId: string): Promise<{
    consolidatedCount: number;
    errors: string[];
  }> {
    const shoppingListProducts = await this.productRepository.find({
      where: {
        inventory: { id: inventoryId },
        isInShoppingList: true,
      },
      order: { name: 'ASC' },
    });

    let consolidatedCount = 0;
    const errors: string[] = [];
    const processedIds = new Set<string>();

    for (const product of shoppingListProducts) {
      if (processedIds.has(product.id)) continue;

      const similarProducts = shoppingListProducts.filter(
        (p) =>
          p.id !== product.id &&
          !processedIds.has(p.id) &&
          this.areSimilarProducts(product.name, p.name),
      );

      for (const similarProduct of similarProducts) {
        const areCompatible = UnitConverter.areUnitsCompatible(
          product.measureUnit,
          similarProduct.measureUnit,
          product.name,
        );

        if (areCompatible) {
          try {
            const conversionResult = UnitConverter.convertUnits(
              similarProduct.wantedSize || 0,
              similarProduct.measureUnit,
              product.measureUnit,
              product.name,
            );

            if (conversionResult.success) {
              product.wantedSize =
                (product.wantedSize || 0) + conversionResult.convertedSize;
              await this.productRepository.save(product);

              await this.productRepository.remove(similarProduct);

              processedIds.add(similarProduct.id);
              consolidatedCount++;
            }
          } catch (error) {
            errors.push(
              `Failed to consolidate ${similarProduct.name}: ${error.message}`,
            );
          }
        }
      }

      processedIds.add(product.id);
    }

    return {
      consolidatedCount,
      errors,
    };
  }

  private areSimilarProducts(name1: string, name2: string): boolean {
    const normalize = (name: string) => name.trim().toLowerCase();
    const n1 = normalize(name1);
    const n2 = normalize(name2);

    if (n1 === n2) return true;

    if (n1.includes(n2) || n2.includes(n1)) return true;

    const words1 = n1.split(/\s+/);
    const words2 = n2.split(/\s+/);

    const commonWords = words1.filter((word) => words2.includes(word));

    return commonWords.length >= Math.min(words1.length, words2.length) * 0.7;  }
}
