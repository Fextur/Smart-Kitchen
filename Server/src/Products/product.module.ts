// src/Products/product.module.ts (Fixed)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { Inventory } from 'src/Inventory/inventory.entity';
import { ProductMatchingModule } from 'src/ProductMatching/productMatching.module'; // Add this import

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Inventory]),
    ProductMatchingModule, // Add this line
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule],
})
export class ProductModule {}
