import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductsDto, UpdateProductDto } from './product.dto';
import { User } from 'src/Users/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProductsDto: CreateProductsDto): Promise<Product[]> {
    const { userId, products } = createProductsDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with id: ${userId} not found`);
    }

    const createdProducts = products.map((product) => this.productRepository.create({
      ...product,
      sizeValueLeft: product.sizeValueLeft ?? product.sizeValue,
      user,
    }));

    return this.productRepository.save(createdProducts);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
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
}
