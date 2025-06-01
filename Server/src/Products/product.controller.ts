import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductsDto, UpdateProductDto } from './product.dto';
import { Product } from './product.entity';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductsDto: CreateProductsDto) {
    return this.productService.create(createProductsDto);
  }

  @Get('by-inventory/:inventoryId')
  async getByInventoryId(
    @Param('inventoryId') inventoryId: string,
  ): Promise<Product[]> {
    return this.productService.findByInventoryId(inventoryId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    console.log({ id });

    return this.productService.delete(id);
  }
}
