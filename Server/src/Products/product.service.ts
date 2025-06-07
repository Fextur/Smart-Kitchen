// Server/src/Products/product.service.ts - Updated with simple unit conversion
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductsDto, UpdateProductsDto } from './product.dto';
import { Inventory } from 'src/Inventory/inventory.entity';
import { ProductMatchingService } from 'src/ProductMatching/productMatching.service';
import { UnitConverter } from 'src/utils/unitConversion';

export interface CreateProductsResult {
  createdProducts: Product[];
  updatedProducts: Product[];
  matchingResults: Array<{
    productName: string;
    action: 'created' | 'merged';
    matchedWith?: string;
    confidence?: string;
    unitConversionApplied?: boolean;
    originalUnit?: string;
    finalUnit?: string;
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
  ) {}

  async mergeProductQuantities(
    existingProduct: Product,
    newProductSize: number,
    newExpirationDate?: Date,
  ): Promise<Product> {
    try {
      const currentSize = Number(existingProduct.size) || 0;
      const additionalSize = Number(newProductSize) || 0;

      if (isNaN(currentSize)) {
        console.warn(
          `Invalid current size for product ${existingProduct.name}: ${existingProduct.size}`,
        );
      }

      if (isNaN(additionalSize)) {
        console.warn(`Invalid additional size: ${newProductSize}`);
        throw new Error(`Invalid size value: ${newProductSize}`);
      }

      const newSize = currentSize + additionalSize;

      existingProduct.size = newSize;

      if (newExpirationDate) {
        existingProduct.expirationDate = newExpirationDate;
      }

      existingProduct.latestUpdateDate = new Date();

      const savedProduct = await this.productRepository.save(existingProduct);

      return savedProduct;
    } catch (error) {
      console.error(`Error merging product quantities:`, error);
      throw new InternalServerErrorException(
        `Failed to merge product quantities: ${error.message}`,
      );
    }
  }

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
      originalUnit?: string;
      finalUnit?: string;
    }> = [];

    let allProducts = await this.productRepository.find({
      where: { inventory: { id: inventoryId } },
      select: ['id', 'name', 'measureUnit', 'size'],
    });

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

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
        // Check unit compatibility before merging
        const compatibility =
          this.productMatchingService.checkProductCompatibility(
            match.matchedProduct,
            product.measureUnit,
            product.name,
          );

        if (compatibility.compatible) {
          const originalUnit = match.matchedProduct.measureUnit;

          const updatedProduct =
            await this.productMatchingService.mergeProductQuantities(
              match.matchedProduct,
              product.size,
              product.measureUnit,
              product.expirationDate,
              true,
            );

          updatedProducts.push(updatedProduct);
          matchingResults.push({
            productName: product.name,
            action: 'merged',
            matchedWith: match.matchedProduct.name,
            confidence: match.confidence,
            unitConversionApplied: originalUnit !== updatedProduct.measureUnit,
            originalUnit: product.measureUnit,
            finalUnit: updatedProduct.measureUnit,
          });

          const index = allProducts.findIndex(
            (p) => p.id === updatedProduct.id,
          );
          if (index !== -1) {
            allProducts[index] = updatedProduct;
          }
        } else {
          // Units not compatible, create new product
          const newProduct = this.productRepository.create({
            ...product,
            latestUpdateDate: new Date(),
            inventory,
            isInInventory: true,
          });

          const savedProduct = await this.productRepository.save(newProduct);
          createdProducts.push(savedProduct);
          matchingResults.push({
            productName: product.name,
            action: 'created',
            unitConversionApplied: false,
            originalUnit: product.measureUnit,
            finalUnit: product.measureUnit,
          });

          allProducts.push(savedProduct);
        }
      } else {
        // No match found, create new product
        const newProduct = this.productRepository.create({
          ...product,
          latestUpdateDate: new Date(),
          inventory,
          isInInventory: true,
        });

        const savedProduct = await this.productRepository.save(newProduct);
        createdProducts.push(savedProduct);
        matchingResults.push({
          productName: product.name,
          action: 'created',
          unitConversionApplied: false,
          originalUnit: product.measureUnit,
          finalUnit: product.measureUnit,
        });

        allProducts.push(savedProduct);
      }
    }

    return {
      createdProducts,
      updatedProducts,
      matchingResults,
    };
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
      // Check if this is a unit change scenario
      if (productDto.id) {
        const existingProduct = await this.productRepository.findOne({
          where: { id: productDto.id },
        });

        if (
          existingProduct &&
          existingProduct.measureUnit !== productDto.measureUnit
        ) {
          // Unit change detected - try conversion
          const conversionResult = UnitConverter.convertUnits(
            productDto.size || existingProduct.size || 0,
            productDto.measureUnit || existingProduct.measureUnit,
            existingProduct.measureUnit, // Keep existing unit as target
            existingProduct.name,
          );

          if (conversionResult.success) {
            productDto.size = conversionResult.convertedSize;
            productDto.measureUnit = existingProduct.measureUnit;
          } else {
            console.warn(
              `Cannot convert units for ${existingProduct.name}: ` +
                `${productDto.measureUnit} -> ${existingProduct.measureUnit}`,
            );
            // Keep the new unit if conversion isn't possible
          }
        }
      }

      const updatedProduct = await this.productRepository.save({
        ...productDto,
        latestUpdateDate: new Date(),
      });
      updatedProducts.push(updatedProduct);
    }

    return updatedProducts;
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.productRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`product with id ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  /**
   * Standardize product units across the entire inventory
   */
  async standardizeInventoryUnits(inventoryId: string): Promise<{
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
        errors.push(`Failed to standardize ${product.name}: ${error.message}`);
      }
    }

    return {
      processedCount,
      conversionsApplied,
      errors,
    };
  }
}
