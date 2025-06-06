import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingListService } from './shoppingList.service';
import { ShoppingListController } from './shoppingList.controller';
import { Product } from 'src/Products/product.entity';
import { Inventory } from 'src/Inventory/inventory.entity';
import { ProductMatchingModule } from 'src/ProductMatching/productMatching.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Inventory]),
    ProductMatchingModule, // Add ProductMatching dependency
  ],
  providers: [ShoppingListService],
  controllers: [ShoppingListController],
  exports: [ShoppingListService],
})
export class ShoppingListModule {}
