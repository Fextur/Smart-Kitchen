import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingList } from './shoppingList.entity';
import { ShoppingListService } from './shoppingList.service';
import { ShoppingListController } from './shoppingList.controller';
import { ProductModule } from 'src/Products/product.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ShoppingList]),
    ProductModule, // <-- Import ProductModule to make ProductRepository available
  ],
  providers: [ShoppingListService],
  controllers: [ShoppingListController],
})
export class ShoppingListModule {}
