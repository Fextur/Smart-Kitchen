import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { Inventory } from 'src/Inventory/inventory.entity';
import { ProductMatchingModule } from 'src/ProductMatching/productMatching.module';
import { AuthModule } from 'src/Auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Inventory]),
    ProductMatchingModule,
    EventEmitterModule,
    AuthModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [TypeOrmModule],
})
export class ProductModule {}
