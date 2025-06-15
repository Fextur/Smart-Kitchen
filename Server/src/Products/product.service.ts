import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from './product.entity';
import { CreateProductsDto, UpdateProductsDto } from './product.dto';
import { Inventory } from 'src/Inventory/inventory.entity';
import { ProductMatchingService } from 'src/ProductMatching/productMatching.service';
import { UnitConverter } from 'src/utils/unitConversion';
import { AlertType,EventTypes } from 'src/types';
import { getEventNameFromType } from 'src/utils/eventUtils';

export interface CreateProductsResult {
  createdProducts: Product[];
  updatedProducts: Product[];
  matchingResults: Array<{
    productName: string;
    action: 'created' | 'merged';
    matchedWith?: string;
    confidence?: string;
    unitConversionApplied?: boolean;
    conversionType?: string;
    originalUnit?: string;
    finalUnit?: string;
    conversionDetails?: string;
  }>;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,

    private productMatchingService: ProductMatchingService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createProductsDto: CreateProductsDto,
  ): Promise<CreateProductsResult> {
    const { inventoryId, products } = createProductsDto;

    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });
    if (!inventory) {
      throw new NotFoundException(
        `Inventory with id: ${inventoryId} not found`,
      );
    }

    const createdProducts: Product[] = [];
    const updatedProducts: Product[] = [];
    const matchingResults: Array<{
      productName: string;
      action: 'created' | 'merged';
      matchedWith?: string;
      confidence?: string;
      unitConversionApplied?: boolean;
      conversionType?: string;
      originalUnit?: string;
      finalUnit?: string;
      conversionDetails?: string;
    }> = [];

    let allProducts = await this.productRepository.find({
      where: { inventory: { id: inventoryId } },
      select: ['id', 'name', 'measureUnit', 'size'],
    });

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      try {
        const matchingResult =
          await this.productMatchingService.findMatchingProducts(
            [product.name],
            inventoryId,
            allProducts,
          );

        const match = matchingResult.matches[0];

        if (
          match.matchedProduct &&
          (match.confidence === 'high' || match.confidence === 'medium')
        ) {
          const compatibility =
            this.productMatchingService.checkProductCompatibility(
              match.matchedProduct,
              product.measureUnit,
              product.name,
            );

          const originalUnit = match.matchedProduct.measureUnit;
          const originalSize = match.matchedProduct.size;

          const updatedProduct =
            await this.productMatchingService.mergeProductQuantities(
              match.matchedProduct,
              product.size,
              product.measureUnit,
              product.expirationDate ?? undefined,
              true,
            );

          updatedProducts.push(updatedProduct);

          const conversionApplied =
            originalUnit !== updatedProduct.measureUnit ||
            product.measureUnit !== updatedProduct.measureUnit;

          matchingResults.push({
            productName: product.name,
            action: 'merged',
            matchedWith: match.matchedProduct.name,
            confidence: match.confidence,
            unitConversionApplied: conversionApplied,
            conversionType: compatibility.conversionType,
            originalUnit: product.measureUnit,
            finalUnit: updatedProduct.measureUnit,
            conversionDetails: `${originalSize} ${originalUnit} + ${product.size} ${product.measureUnit} = ${updatedProduct.size} ${updatedProduct.measureUnit}`,
          });

          const index = allProducts.findIndex(
            (p) => p.id === updatedProduct.id,
          );
          if (index !== -1) {
            allProducts[index] = updatedProduct;
          }
        } else {
          const newProduct = await this.createNewProduct(product, inventory);
          createdProducts.push(newProduct);
          allProducts.push(newProduct);

          matchingResults.push({
            productName: product.name,
            action: 'created',
            unitConversionApplied: false,
            originalUnit: product.measureUnit,
            finalUnit: product.measureUnit,
            conversionDetails: `New product - no existing match found`,
          });
        }
      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error);

        try {
          const newProduct = await this.createNewProduct(product, inventory);
          createdProducts.push(newProduct);

          matchingResults.push({
            productName: product.name,
            action: 'created',
            unitConversionApplied: false,
            originalUnit: product.measureUnit,
            finalUnit: product.measureUnit,
            conversionDetails: `Created due to processing error: ${error.message}`,
          });
        } catch (createError) {
          console.error(`Failed to create fallback product:`, createError);
          throw new InternalServerErrorException(
            `Failed to process product ${product.name}: ${createError.message}`,
          );
        }
      }
    }

    return {
      createdProducts,
      updatedProducts,
      matchingResults,
    };
  }

  private async createNewProduct(
    productDto: any,
    inventory: any,
  ): Promise<Product> {
    const newProduct = this.productRepository.create({
      ...productDto,
      latestUpdateDate: new Date(),
      inventory,
      isInInventory: true,
    });

    const savedProduct = await this.productRepository.save(newProduct);
    return Array.isArray(savedProduct) ? savedProduct[0] : savedProduct;
  }

  async findByInventoryId(inventoryId: string): Promise<Product[]> {
    return this.productRepository.find({
      select: [
        'id',
        'name',
        'size',
        'measureUnit',
        'expirationDate',
        'latestUpdateDate',
      ],
      where: { inventory: { id: inventoryId }, isInInventory: true },
    });
  }

  async findByShoppingList(inventoryId: string): Promise<Partial<Product>[]> {
    const products = await this.productRepository.find({
      select: ['id', 'name', 'measureUnit', 'isChecked', 'wantedSize'],
      where: { inventory: { id: inventoryId }, isInShoppingList: true },
    });

    return products.map(({ wantedSize, ...product }) => ({
      ...product,
      size: wantedSize,
      wantedSize: undefined,
    }));
  }

  async updateBulk(updateProductsDto: UpdateProductsDto): Promise<Product[]> {
    const { products } = updateProductsDto;
    const updatedProducts: Product[] = [];

    for (const productDto of products) {
      try {
        if (productDto.id) {
          const existingProduct = await this.productRepository.findOne({
            where: { id: productDto.id },
          });

          if (!existingProduct) {
            throw new NotFoundException(
              `Product with id ${productDto.id} not found`,
            );
          }

          if (
            productDto.measureUnit &&
            existingProduct.measureUnit !== productDto.measureUnit
          ) {
            const compatibility =
              this.productMatchingService.checkProductCompatibility(
                existingProduct,
                productDto.measureUnit,
                existingProduct.name,
              );

            if (compatibility.compatible) {
              const conversionResult = UnitConverter.convertUnits(
                productDto.size || existingProduct.size || 0,
                productDto.measureUnit,
                existingProduct.measureUnit,
                existingProduct.name,
              );

              if (conversionResult.success) {
                productDto.size = conversionResult.convertedSize;
                productDto.measureUnit = existingProduct.measureUnit;
              } else {
                console.warn(`Conversion failed, allowing unit change`);
              }
            } else {
              console.warn(`Units incompatible: ${compatibility.reason}`);
            }
          }

          if (productDto.name !== undefined)
            existingProduct.name = productDto.name;
          if (productDto.size !== undefined)
            existingProduct.size = productDto.size;
          if (productDto.measureUnit !== undefined)
            existingProduct.measureUnit = productDto.measureUnit;

          if (productDto.expirationDate !== undefined) {
            existingProduct.expirationDate =
              typeof productDto.expirationDate === 'string' &&
              productDto.expirationDate === ''
                ? null
                : productDto.expirationDate;
          }

          existingProduct.latestUpdateDate = new Date();

          const savedProduct =
            await this.productRepository.save(existingProduct);
          updatedProducts.push(savedProduct);
        } else {
          throw new BadRequestException('Product ID is required for update');
        }
      } catch (error) {
        console.error(`Error updating product ${productDto.id}:`, error);
        throw new InternalServerErrorException(
          `Failed to update product: ${error.message}`,
        );
      }
    }

    return updatedProducts;
  }
  async delete(id: string, userId: string): Promise<void> {
    try {
      // First, find the product to check if it's in shopping list
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['inventory']
      });

      if (!product) {
        throw new NotFoundException(`product with id ${id} not found`);
      }

      const wasInShoppingList = product.isInShoppingList;
      const productName = product.name;

      // Delete the product
      const result = await this.productRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`product with id ${id} not found`);
      }

      // If the product was in the shopping list, emit an event
      if (wasInShoppingList) {
        console.log(`[ProductService] Product "${productName}" was in shopping list, emitting EDIT_SHOPPING_LIST event for userId: ${userId}`);
          const eventName = getEventNameFromType(AlertType.EDIT_SHOPPING_LIST);
        this.eventEmitter.emit(EventTypes.EDIT_SHOPPING_LIST, {
          type: AlertType.EDIT_SHOPPING_LIST,
          userId,
          metadata: {
            action: 'product-deleted',
            itemName: [productName]
          },
          broadcastToUserInventory: true,
        });
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  async getConversionPreview(
    productId: string,
    newSize: number,
    newUnit: string,
  ): Promise<{
    success: boolean;
    convertedSize?: number;
    conversionType?: string;
    explanation?: string;
  }> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    const newMeasureUnit = this.mapStringToMeasureUnit(newUnit);

    return this.productMatchingService.getConversionPreview(
      newSize,
      newMeasureUnit,
      product.measureUnit,
      product.name,
    );
  }

  private mapStringToMeasureUnit(unit: string): any {
    const unitMappings = {
      גרם: 'GRAM',
      קילוגרם: 'KILOGRAM',
      ליטר: 'LITER',
      מיליליטר: 'MILLILITER',
      יחידות: 'UNIT',
    };
    return unitMappings[unit] || unit;
  }

  async optimizeInventoryUnits(inventoryId: string): Promise<{
    processedCount: number;
    conversionsApplied: number;
    errors: string[];
  }> {
    const products = await this.productRepository.find({
      where: { inventory: { id: inventoryId } },
    });

    let processedCount = 0;
    let conversionsApplied = 0;
    const errors: string[] = [];

    for (const product of products) {
      try {
        const preferredUnit = UnitConverter.getPreferredUnit(
          product.size || 0,
          product.measureUnit,
          product.name,
        );

        if (preferredUnit !== product.measureUnit) {
          const conversionResult = UnitConverter.convertUnits(
            product.size || 0,
            product.measureUnit,
            preferredUnit,
            product.name,
          );

          if (conversionResult.success) {
            product.size = conversionResult.convertedSize;
            product.measureUnit = preferredUnit;
            product.latestUpdateDate = new Date();

            await this.productRepository.save(product);
            conversionsApplied++;
          }
        }

        processedCount++;
      } catch (error) {
        errors.push(`Failed to optimize ${product.name}: ${error.message}`);
      }
    }

    return {
      processedCount,
      conversionsApplied,
      errors,
    };
  }
}
