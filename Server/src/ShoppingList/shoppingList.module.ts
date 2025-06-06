import { Module } from '@nestjs/common';
import { ShoppingListService } from './shoppingList.service';
import { ShoppingListController } from './shoppingList.controller';
import { ProductModule } from 'src/Products/product.module';

@Module({
  imports: [ProductModule],
  providers: [ShoppingListService],
  controllers: [ShoppingListController],
})
export class ShoppingListModule {}
