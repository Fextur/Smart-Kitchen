// Server/src/ShoppingList/shoppingList.service.ts - Updated with simple unit conversion
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/Products/product.entity';
import { Inventory } from 'src/Inventory/inventory.entity';
import { CreateShoppingListDto } from './shoppingList.dto';
import { ProductMatchingService } from 'src/ProductMatching/productMatching.service';
import { UnitConverter } from 'src/utils/unitConversion';
import { MeasureUnit } from 'src/types';

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
  ) {}

  async addProductsToShoppingList(
    createShoppingListDto: CreateShoppingListDto,
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

    // Handle products with IDs (direct references)
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

      // Check if unit conversion is needed for shopping list
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
        );

        existingProduct.wantedSize = mergeResult.size;
        existingProduct.isInShoppingList = true;
        existingProduct.latestUpdateDate = new Date();

        const savedProduct = await this.productRepository.save(existingProduct);
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
        // Units incompatible, create separate entry
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

    // Handle products without IDs (need matching)
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
          // Check unit compatibility
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
            // Create new product with incompatible units
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
          // No match found, create new product
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
      }
    }

    return {
      updatedProducts,
      createdProducts,
      matchingResults,
    };
  }

  async transferProductsToInventory(inventoryId: string): Promise<void> {
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

      await this.productRepository.save(product);
    }
  }

  async transferProductsToShoppingList(
    inventoryId: string,
    product: Product,
  ): Promise<void> {
    const existingProduct = await this.productRepository.findOne({
      where: { id: product.id, inventory: { id: inventoryId } },
    });

    if (!existingProduct) {
      throw new NotFoundException(
        `Product with id ${product.id} not found in inventory ${inventoryId}`,
      );
    }

    // Units should be compatible since it's the same product
    existingProduct.wantedSize =
      (existingProduct.wantedSize || 0) + (product.size || 0);
    existingProduct.size = Math.max(
      0,
      (existingProduct.size || 0) - (product.size || 0),
    );
    existingProduct.isInShoppingList = true;
    existingProduct.latestUpdateDate = new Date();

    await this.productRepository.save(existingProduct);
  }

  async clearShoppingList(inventoryId: string): Promise<void> {
    const shoppingListProducts = await this.productRepository.find({
      where: {
        inventory: { id: inventoryId },
        isInShoppingList: true,
      },
    });

    for (const product of shoppingListProducts) {
      product.isInShoppingList = false;
      product.wantedSize = 0;
      product.isChecked = false;
      await this.productRepository.save(product);
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
  ): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id: productId, isInShoppingList: true },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with id ${productId} not found in shopping list`,
      );
    }

    // Handle unit changes in shopping list
    if (updates.measureUnit && updates.measureUnit !== product.measureUnit) {
      const newUnit = this.mapStringToMeasureUnit(updates.measureUnit);
      const areCompatible = UnitConverter.areUnitsCompatible(
        product.measureUnit,
        newUnit,
        product.name,
      );

      if (areCompatible) {
        // Convert existing wantedSize to new unit
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
        // Keep original unit if conversion not possible
        delete updates.measureUnit;
      }
    }

    Object.assign(product, updates);
    product.latestUpdateDate = new Date();

    return await this.productRepository.save(product);
  }

  async removeProductFromShoppingList(productId: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId, isInShoppingList: true },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with id ${productId} not found in shopping list`,
      );
    }

    product.isInShoppingList = false;
    product.wantedSize = 0;
    product.isChecked = false;
    await this.productRepository.save(product);
  }

  /**
   * Map string unit to MeasureUnit enum
   */
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

  /**
   * Consolidate shopping list items with compatible units
   */
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

      // Find similar products that can be consolidated
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
            // Convert and merge
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

              // Remove the similar product
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

  /**
   * Check if two product names are similar enough to consolidate
   */
  private areSimilarProducts(name1: string, name2: string): boolean {
    const normalize = (name: string) => name.trim().toLowerCase();
    const n1 = normalize(name1);
    const n2 = normalize(name2);

    // Exact match
    if (n1 === n2) return true;

    // One contains the other
    if (n1.includes(n2) || n2.includes(n1)) return true;

    // Similar with minor differences (brands, etc.)
    const words1 = n1.split(/\s+/);
    const words2 = n2.split(/\s+/);

    const commonWords = words1.filter((word) => words2.includes(word));

    // If majority of words are common, consider similar
    return commonWords.length >= Math.min(words1.length, words2.length) * 0.7;
  }
}
