import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ShoppingListService } from './shoppingList.service';
import { CreateShoppingListDto } from './shoppingList.dto';
import { instanceToPlain } from 'class-transformer';
import { Product } from 'src/Products/product.entity';

@Controller('shopping-list')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Post()
  async addProductsToShoppingList(
    @Body() createShoppingListDto: CreateShoppingListDto,
  ) {
    const shoppingList = this.shoppingListService.addProductsToShoppingList(
      createShoppingListDto,
    );

    return instanceToPlain(shoppingList);
  }

  @Post(':inventoryId/transfer-to-inventory')
  async transferProductsToInventory(@Param('inventoryId') inventoryId: string) {
    await this.shoppingListService.transferProductsToInventory(inventoryId);
    return {
      message: 'Products transferred to inventory and shopping list cleared',
    };
  }

  @Post(':inventoryId/transfer-to-shopping-list')
  async transferProductsToShoppingList(
    @Param('inventoryId') inventoryId: string,
    @Body('product') product: Product,
  ) {
    await this.shoppingListService.transferProductsToShoppingList(
      inventoryId,
      product,
    );
    return {
      message: 'Products successfully transferred to the shopping list',
    };
  }

  @Delete(':inventoryId')
  async clearShoppingList(@Param('inventoryId') inventoryId: string) {
    await this.shoppingListService.clearShoppingList(inventoryId);
    return { message: 'Shopping list cleared' };
  }
}
