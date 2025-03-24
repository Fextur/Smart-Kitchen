import { Module } from '@nestjs/common';
import { VisionModule } from 'src/config/vision.config';
import { ReceiptScannerController } from './receiptScanner.controller';
import { ReceiptScannerService } from './receiptScanner.service';

@Module({
  imports: [VisionModule],
  controllers: [ReceiptScannerController],
  providers: [ReceiptScannerService],
})
export class ReceiptScannerModule {}
