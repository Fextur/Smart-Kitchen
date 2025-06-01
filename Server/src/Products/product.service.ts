import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductsDto, UpdateProductDto } from './product.dto';
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
        sizeValueLeft: product.sizeValueLeft ?? product.sizeValue,
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

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with id:${id} not found`);
    }

    product.sizeValueLeft = updateProductDto.sizeValueLeft;

    return this.productRepository.save(product);
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.productRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`product with id ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete product');
    }
  }
}
