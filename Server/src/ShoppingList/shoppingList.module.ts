import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingListService } from './shoppingList.service';
import { ShoppingListController } from './shoppingList.controller';
import { Product } from 'src/Products/product.entity';
import { Inventory } from 'src/Inventory/inventory.entity';
import { ProductMatchingModule } from 'src/ProductMatching/productMatching.module';
import { AuthModule } from 'src/Auth/auth.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Inventory]),
    ProductMatchingModule,
    AuthModule, // Import AuthModule to access JwtAuthGuard
    EventEmitterModule, // Import EventEmitterModule for events
  ],
  providers: [ShoppingListService],
  controllers: [ShoppingListController],
  exports: [ShoppingListService],
})
export class ShoppingListModule {}
