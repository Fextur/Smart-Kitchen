import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShoppingList } from './shoppingList.entity';
import { Product } from 'src/Products/product.entity';
import { Inventory } from 'src/Inventory/inventory.entity';
import { CreateShoppingListDto } from './shoppingList.dto';

@Injectable()
export class ShoppingListService {
  constructor(
    @InjectRepository(ShoppingList)
    private shoppingListRepository: Repository<ShoppingList>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async getShoppingListWithProducts(
    inventoryId: string,
  ): Promise<ShoppingList> {
    let shoppingList = await this.shoppingListRepository.findOne({
      where: { inventory: { id: inventoryId } },
      relations: ['products'],
    });

    if (!shoppingList) {
      shoppingList = this.shoppingListRepository.create({
        inventory: { id: inventoryId },
        products: [],
      });

      await this.shoppingListRepository.save(shoppingList);
    }

    return shoppingList;
  }

  async addProductsToShoppingList(
    createShoppingListDto: CreateShoppingListDto,
  ): Promise<ShoppingList> {
    const { inventoryId, products } = createShoppingListDto;

    let shoppingList = await this.shoppingListRepository.findOne({
      where: { inventory: { id: inventoryId } },
      relations: ['products', 'inventory'],
    });

    if (!shoppingList) {
      shoppingList = this.shoppingListRepository.create({
        inventory: { id: inventoryId },
        products: [],
      });

      shoppingList = await this.shoppingListRepository.save(shoppingList);
    }

    const createdProducts = products.map((product) =>
      this.productRepository.create({ ...product, shoppingList }),
    );
    await this.productRepository.save(createdProducts);

    shoppingList.products = shoppingList.products
      ? [...shoppingList.products, ...createdProducts]
      : [...createdProducts];
    return this.shoppingListRepository.save(shoppingList);
  }

  async transferProductsToInventory(inventoryId: string): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
      relations: ['shoppingList', 'shoppingList.products'],
    });

    if (!inventory || !inventory.shoppingList) {
      throw new NotFoundException(
        `No shopping list found for inventory ID ${inventoryId}`,
      );
    }

    const shoppingList = inventory.shoppingList;
    const productsToTransfer = shoppingList.products;

    if (productsToTransfer.length > 0) {
      for (const product of productsToTransfer) {
        product.inventory = inventory;

        await this.productRepository.save(product);
      }

      shoppingList.products = [];
      await this.shoppingListRepository.save(shoppingList);
    }
  }

  async clearShoppingList(inventoryId: string): Promise<void> {
    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
      relations: ['shoppingList'],
    });

    if (!inventory || !inventory.shoppingList) {
      throw new NotFoundException(
        `No shopping list found for inventory ID ${inventoryId}`,
      );
    }

    const shoppingList = inventory.shoppingList;
    shoppingList.products = [];
    await this.shoppingListRepository.save(shoppingList);
  }
}
