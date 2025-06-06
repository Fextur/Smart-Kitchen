import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductsDto, UpdateProductsDto } from './product.dto';
import { Inventory } from 'src/Inventory/inventory.entity';
import { ProductMatchingService } from 'src/ProductMatching/productMatching.service';

export interface CreateProductsResult {
  createdProducts: Product[];
  updatedProducts: Product[];
  matchingResults: Array<{
    productName: string;
    action: 'created' | 'merged';
    matchedWith?: string;
    confidence?: string;
  }>;
}

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,

    private productMatchingService: ProductMatchingService,
  ) {}

  async create(
    createProductsDto: CreateProductsDto,
  ): Promise<CreateProductsResult> {
    const { inventoryId, products } = createProductsDto;

    const inventory = await this.inventoryRepository.findOne({
      where: { id: inventoryId },
    });
    if (!inventory) {
      throw new NotFoundException(
        `Inventory with id: ${inventoryId} not found`,
      );
    }

    // Get product names for matching
    const productNames = products.map((p) => p.name);

    // Find matching products using the matching service
    const matchingResult =
      await this.productMatchingService.findMatchingProducts(
        productNames,
        inventoryId,
      );

    const createdProducts: Product[] = [];
    const updatedProducts: Product[] = [];
    const matchingResults: Array<{
      productName: string;
      action: 'created' | 'merged';
      matchedWith?: string;
      confidence?: string;
    }> = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const match = matchingResult.matches[i];

      // Only merge if we have high or medium confidence match
      if (
        match.matchedProduct &&
        (match.confidence === 'high' || match.confidence === 'medium')
      ) {
        // Merge with existing product - add quantities, override expiration and update date
        const updatedProduct =
          await this.productMatchingService.mergeProductQuantities(
            match.matchedProduct,
            product.size,
            product.expirationDate,
          );

        updatedProducts.push(updatedProduct);
        matchingResults.push({
          productName: product.name,
          action: 'merged',
          matchedWith: match.matchedProduct.name,
          confidence: match.confidence,
        });
      } else {
        // Create new product - no good match found
        const newProduct = this.productRepository.create({
          ...product,
          latestUpdateDate: new Date(),
          inventory,
          isInInventory: true,
        });

        const savedProduct = await this.productRepository.save(newProduct);
        createdProducts.push(savedProduct);
        matchingResults.push({
          productName: product.name,
          action: 'created',
        });
      }
    }

    return {
      createdProducts,
      updatedProducts,
      matchingResults,
    };
  }

  async findByInventoryId(inventoryId: string): Promise<Product[]> {
    return this.productRepository.find({
      select: [
        'id',
        'name',
        'size',
        'measureUnit',
        'expirationDate',
        'latestUpdateDate',
      ],
      where: { inventory: { id: inventoryId }, isInInventory: true },
    });
  }

  async findByShoppingList(inventoryId: string): Promise<Partial<Product>[]> {
    const products = await this.productRepository.find({
      select: ['id', 'name', 'measureUnit', 'isChecked', 'wantedSize'],
      where: { inventory: { id: inventoryId }, isInShoppingList: true },
    });

    return products.map(({ wantedSize, ...product }) => ({
      ...product,
      size: wantedSize,
      wantedSize: undefined,
    }));
  }

  async updateBulk(updateProductsDto: UpdateProductsDto): Promise<Product[]> {
    const { products } = updateProductsDto;

    const updatedProducts: Product[] = [];

    for (const productDto of products) {
      const updatedProduct = await this.productRepository.save({
        ...productDto,
        latestUpdateDate: new Date(),
      });
      updatedProducts.push(updatedProduct);
    }

    return updatedProducts;
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
