import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/Products/product.entity';
import { Inventory } from 'src/Inventory/inventory.entity';
import { CreateShoppingListDto } from './shoppingList.dto';
import { ProductMatchingService } from 'src/ProductMatching/productMatching.service';

export interface ShoppingListResult {
  updatedProducts: Product[];
  createdProducts: Product[];
  matchingResults: Array<{
    productName: string;
    action: 'updated' | 'created';
    matchedWith?: string;
    confidence?: string;
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

    // Verify inventory exists
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
    }> = [];

    // Separate products with IDs from products without IDs
    const productsWithIds = products.filter((p) => p.id);
    const productsWithoutIds = products.filter((p) => !p.id);

    // Handle products with existing IDs (Type 1: Update existing products)
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

      // Add to wantedSize and ensure it's in shopping list
      existingProduct.wantedSize =
        (existingProduct.wantedSize || 0) + productDto.size;
      existingProduct.isInShoppingList = true;

      const savedProduct = await this.productRepository.save(existingProduct);
      updatedProducts.push(savedProduct);

      matchingResults.push({
        productName: productDto.name,
        action: 'updated',
        matchedWith: existingProduct.name,
      });
    }

    // Handle products without IDs (Type 2: Manual input - check for matches)
    if (productsWithoutIds.length > 0) {
      const productNames = productsWithoutIds.map((p) => p.name);

      // Use product matching service to find potential matches
      const matchingResult =
        await this.productMatchingService.findMatchingProducts(
          productNames,
          inventoryId,
        );

      for (let i = 0; i < productsWithoutIds.length; i++) {
        const productDto = productsWithoutIds[i];
        const match = matchingResult.matches[i];

        // If we have a high or medium confidence match, update the existing product
        if (
          match.matchedProduct &&
          (match.confidence === 'high' || match.confidence === 'medium')
        ) {
          // Update existing product's wantedSize
          match.matchedProduct.wantedSize =
            (match.matchedProduct.wantedSize || 0) + productDto.size;
          match.matchedProduct.isInShoppingList = true;

          const savedProduct = await this.productRepository.save(
            match.matchedProduct,
          );
          updatedProducts.push(savedProduct);

          matchingResults.push({
            productName: productDto.name,
            action: 'updated',
            matchedWith: match.matchedProduct.name,
            confidence: match.confidence,
          });
        } else {
          // Create new product (not in inventory yet)
          const newProduct = this.productRepository.create({
            name: productDto.name,
            size: 0, // Not in inventory yet
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
    // Get all products in shopping list for this inventory
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

    // Transfer each product to inventory
    for (const product of shoppingListProducts) {
      // Add wantedSize to actual size (or set size if it was 0)
      if (product.wantedSize) {
        product.size = (product.size || 0) + product.wantedSize;
        product.wantedSize = 0; // Reset wanted size
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
    // Find the actual product in the database
    const existingProduct = await this.productRepository.findOne({
      where: { id: product.id, inventory: { id: inventoryId } },
    });

    if (!existingProduct) {
      throw new NotFoundException(
        `Product with id ${product.id} not found in inventory ${inventoryId}`,
      );
    }

    // Move size to wantedSize and add to shopping list
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
    // Get all products in shopping list for this inventory
    const shoppingListProducts = await this.productRepository.find({
      where: {
        inventory: { id: inventoryId },
        isInShoppingList: true,
      },
    });

    for (const product of shoppingListProducts) {
      // If product exists in inventory, just remove from shopping list
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

    // Product exists in inventory, just remove from shopping list
    product.isInShoppingList = false;
    product.wantedSize = 0;
    product.isChecked = false;
    await this.productRepository.save(product);
  }
}
