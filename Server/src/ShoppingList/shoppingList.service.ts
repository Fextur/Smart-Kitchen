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
}
