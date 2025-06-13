import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductsDto, UpdateProductsDto } from './product.dto';
import { Product } from './product.entity';
import { JwtAuthGuard } from 'src/Auth/jwt-auth.guard';
import { CurrentUser } from 'src/Auth/current-user.decorator';

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

  @Get('by-shopping-list/:inventoryId')
  async getByShoppingList(
    @Param('inventoryId') inventoryId: string,
  ): Promise<Partial<Product>[]> {
    return this.productService.findByShoppingList(inventoryId);
  }

  @Post('updateBulk')
  async update(@Body() updateProductsDto: UpdateProductsDto) {
    return this.productService.updateBulk(updateProductsDto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ): Promise<void> {
    return this.productService.delete(id, user.id);
  }
}
