import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ShoppingListService } from './shoppingList.service';
import { CreateShoppingListDto } from './shoppingList.dto';
import { instanceToPlain } from 'class-transformer';

@Controller('shopping-list')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Get(':inventoryId')
  async getShoppingListWithProducts(@Param('inventoryId') inventoryId: string) {
    return this.shoppingListService.getShoppingListWithProducts(inventoryId);
  }

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

  @Delete(':inventoryId')
  async clearShoppingList(@Param('inventoryId') inventoryId: string) {
    await this.shoppingListService.clearShoppingList(inventoryId);
    return { message: 'Shopping list cleared' };
  }
}
