import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductsDto, UpdateProductsDto } from './product.dto';
import { User } from 'src/Users/user.entity';
import { Inventory } from 'src/Inventory/inventory.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<User>,
  ) {}

  async create(createProductsDto: CreateProductsDto): Promise<Product[]> {
    const { inventoryId, products } = createProductsDto;

    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });
    if (!inventory) {
      throw new NotFoundException(
        `Inventory with id: ${inventoryId} not found`,
      );
    }

    const createdProducts = products.map((product) =>
      this.productRepository.create({
        ...product,
        latestUpdateDate: new Date(),
        inventory,
      }),
    );

    return this.productRepository.save(createdProducts);
  }

  async findByInventoryId(inventoryId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { inventory: { id: inventoryId } },
    });
  }

  async updateBulk(updateProductsDto: UpdateProductsDto): Promise<Product[]> {
    const { products } = updateProductsDto;

    const updatedProducts: Product[] = [];

    for (const productDto of products) {
      const updatedProduct = await this.productRepository.save(productDto);
      updatedProducts.push({ ...updatedProduct, latestUpdateDate: new Date() });
    }

    return updatedProducts;
  }
}
