import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/Products/product.entity';
import { ProductMatchingService } from './productMatching.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductMatchingService],
  exports: [ProductMatchingService],
})
export class ProductMatchingModule {}
