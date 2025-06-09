import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Put,
  Patch,
} from '@nestjs/common';
import {
  ShoppingListService,
  ShoppingListResult,
} from './shoppingList.service';
import { CreateShoppingListDto } from './shoppingList.dto';
import { Product } from 'src/Products/product.entity';

@Controller('shopping-list')
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}

  @Post()
  async addProductsToShoppingList(
    @Body() createShoppingListDto: CreateShoppingListDto,
  ): Promise<ShoppingListResult> {
    return this.shoppingListService.addProductsToShoppingList(
      createShoppingListDto,
    );
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
      message: 'Product successfully transferred to the shopping list',
    };
  }

  @Delete(':inventoryId')
  async clearShoppingList(@Param('inventoryId') inventoryId: string) {
    await this.shoppingListService.clearShoppingList(inventoryId);
    return { message: 'Shopping list cleared' };
  }

  @Patch('product/:productId')
  async updateProductInShoppingList(
    @Param('productId') productId: string,
    @Body()
    updates: Partial<{
      wantedSize: number;
      isChecked: boolean;
      name: string;
      measureUnit: string;
    }>,
  ): Promise<Product> {
    return this.shoppingListService.updateProductInShoppingList(
      productId,
      updates,
    );
  }

  @Delete('product/:productId')
  async removeProductFromShoppingList(@Param('productId') productId: string) {
    await this.shoppingListService.removeProductFromShoppingList(productId);
    return { message: 'Product removed from shopping list' };
  }
}
