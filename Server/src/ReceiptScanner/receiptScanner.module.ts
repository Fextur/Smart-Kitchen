// src/ReceiptScanner/receiptScanner.module.ts (Complete Updated File)
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisionModule } from 'src/config/vision.config';
import { Product } from 'src/Products/product.entity';
import { ReceiptScannerController } from './receiptScanner.controller';
import { ReceiptScannerService } from './receiptScanner.service';

@Module({
  imports: [VisionModule, TypeOrmModule.forFeature([Product])],
  controllers: [ReceiptScannerController],
  providers: [ReceiptScannerService],
})
export class ReceiptScannerModule {}
