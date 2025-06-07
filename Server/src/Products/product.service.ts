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

export interface CreateProductsResult {
  createdProducts: Product[];
  updatedProducts: Product[];
  matchingResults: Array<{
    productName: string;
    action: 'created' | 'merged';
    matchedWith?: string;
    confidence?: string;
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
      // Ensure both values are valid numbers
      const currentSize = Number(existingProduct.size) || 0;
      const additionalSize = Number(newProductSize) || 0;

      // Validate that we have valid numbers
      if (isNaN(currentSize)) {
        console.warn(
          `Invalid current size for product ${existingProduct.name}: ${existingProduct.size}`,
        );
      }

      if (isNaN(additionalSize)) {
        console.warn(`Invalid additional size: ${newProductSize}`);
        throw new Error(`Invalid size value: ${newProductSize}`);
      }

      // Calculate new size
      const newSize = currentSize + additionalSize;

      // Update the product
      existingProduct.size = newSize;

      // Override expiration date if new one is provided
      if (newExpirationDate) {
        existingProduct.expirationDate = newExpirationDate;
      }

      // Always override the latest update date
      existingProduct.latestUpdateDate = new Date();

      // Save and return
      const savedProduct = await this.productRepository.save(existingProduct);

      return savedProduct;
    } catch (error) {
      console.error(`Error merging product quantities:`, error);
      throw new InternalServerErrorException(
        `Failed to merge product quantities: ${error.message}`,
      );
    }
  }

  // Also let's check the ProductService create method for potential issues
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
    }> = [];

    // Keep track of all products (existing + newly created) for subsequent matches
    let allProducts = await this.productRepository.find({
      where: { inventory: { id: inventoryId } },
      select: ['id', 'name', 'measureUnit', 'size'],
    });

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      const matchingResult =
        await this.productMatchingService.findMatchingProducts(
          [product.name], // Process one at a time
          inventoryId,
          allProducts, // Pass current product list
        );

      const match = matchingResult.matches[0];

      // Only merge if we have high or medium confidence match
      if (
        match.matchedProduct &&
        (match.confidence === 'high' || match.confidence === 'medium')
      ) {
        // Merge with existing product - add quantities, override expiration and update date
        const updatedProduct =
          await this.productMatchingService.mergeProductQuantities(
            match.matchedProduct,
            product.size,
            product.expirationDate,
            true,
          );

        updatedProducts.push(updatedProduct);
        matchingResults.push({
          productName: product.name,
          action: 'merged',
          matchedWith: match.matchedProduct.name,
          confidence: match.confidence,
        });

        // Update the product in our tracking list
        const index = allProducts.findIndex((p) => p.id === updatedProduct.id);
        if (index !== -1) {
          allProducts[index] = updatedProduct;
        }
      } else {
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
        });

        // Add the new product to our tracking list for subsequent matches
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
}
