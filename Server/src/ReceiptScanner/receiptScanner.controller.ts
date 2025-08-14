import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptScannerService, ParsedProduct } from './receiptScanner.service';

@Controller('receipt-scanner')
export class ReceiptScannerController {
  constructor(private readonly receiptScannerService: ReceiptScannerService) {}

  @Post('scan')
  @UseInterceptors(FileInterceptor('receipt'))
  async scanReceipt(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 }), // 20MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('inventoryId') inventoryId?: string,
  ): Promise<ParsedProduct[]> {
    return this.receiptScannerService.scanReceipt(file, {
      bypassScanning: false,
      inventoryId,
    });
  }
}
