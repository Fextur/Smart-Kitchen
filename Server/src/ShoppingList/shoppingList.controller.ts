import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ShoppingListService,
  ShoppingListResult,
} from './shoppingList.service';
import { CreateShoppingListDto } from './shoppingList.dto';
import { Product } from 'src/Products/product.entity';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from 'src/Auth/current-user.decorator';

@Controller('shopping-list')
@UseGuards(JwtAuthGuard) // Re-enable JWT protection
export class ShoppingListController {
  constructor(private readonly shoppingListService: ShoppingListService) {}  @Post()
  async addProductsToShoppingList(
    @Body() createShoppingListDto: CreateShoppingListDto,
    @CurrentUser() user: AuthenticatedUser, // User is required again
  ): Promise<ShoppingListResult> {
    return this.shoppingListService.addProductsToShoppingList(
      createShoppingListDto,
      user, // Pass user data to service
    );
  }

  @Post(':inventoryId/transfer-to-shopping-list')
  async transferProductsToShoppingList(
    @Param('inventoryId') inventoryId: string,
    @Body('product') product: Product,
    @CurrentUser() user: AuthenticatedUser, // Extract user from token
  ) {
    await this.shoppingListService.transferProductsToShoppingList(
      inventoryId,
      product,
      user, // Pass user data to service
    );
    return {
      message: 'Product successfully transferred to the shopping list',
    };
  }

  @Delete(':inventoryId')
  async clearShoppingList(
    @Param('inventoryId') inventoryId: string,
    @CurrentUser() user: AuthenticatedUser, // Extract user from token
  ) {
    await this.shoppingListService.clearShoppingList(inventoryId, user);
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
    @CurrentUser() user: AuthenticatedUser, // Extract user from token
  ): Promise<Product> {
    return this.shoppingListService.updateProductInShoppingList(
      productId,
      updates,
      user, // Pass user data to service
    );
  }

  @Delete('product/:productId')
  async removeProductFromShoppingList(
    @Param('productId') productId: string,
    @CurrentUser() user: AuthenticatedUser, // Extract user from token
  ) {
    await this.shoppingListService.removeProductFromShoppingList(
      productId,
      user, // Pass user data to service
    );
    return { message: 'Product removed from shopping list' };
  }
}
