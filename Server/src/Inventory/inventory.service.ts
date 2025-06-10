import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';
import { KitchenHashUtils } from 'src/utils/kitchenHashUtils';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async findById(id: string): Promise<Inventory> {
    try {
      const inventory = await this.inventoryRepository.findOne({
        where: { id },
        relations: ['users', 'products'],
      });
      if (!inventory) {
        throw new NotFoundException(`Inventory with id ${id} not found`);
      }
      return inventory;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch inventory');
    }
  }

  async findByKitchenHash(kitchenHash: string): Promise<Inventory | null> {
    try {
      return await this.inventoryRepository.findOne({
        where: { kitchenHash },
        relations: ['users', 'products'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch inventory by hash',
      );
    }
  }

  async findByName(name: string): Promise<Inventory[]> {
    try {
      const inventories = await this.inventoryRepository.find({
        where: { name },
        relations: ['users', 'products'],
      });

      if (inventories.length === 0) {
        throw new NotFoundException(
          `No inventory items found with name "${name}"`,
        );
      }

      return inventories;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(
        'Failed to fetch inventory items by name',
      );
    }
  }

  async findAll(): Promise<Inventory[]> {
    try {
      return await this.inventoryRepository.find({
        relations: ['users', 'products'],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch inventories');
    }
  }

  async create(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    try {
      const kitchenHash = await this.generateUniqueKitchenHash();

      const inventory = this.inventoryRepository.create({
        ...createInventoryDto,
        kitchenHash,
      });

      return await this.inventoryRepository.save(inventory);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException(
          'Kitchen hash collision occurred, please try again',
        );
      }
      throw new InternalServerErrorException('Failed to create inventory item');
    }
  }

  async update(updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    try {
      const inventory = await this.inventoryRepository.findOneBy({
        id: updateInventoryDto.id,
      });
      if (!inventory) {
        throw new NotFoundException(
          `Inventory item with id ${updateInventoryDto.id} not found`,
        );
      }

      Object.assign(inventory, updateInventoryDto);
      return await this.inventoryRepository.save(inventory);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update inventory item');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.inventoryRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Inventory with id ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete inventory');
    }
  }

  private async generateUniqueKitchenHash(): Promise<string> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const hash = KitchenHashUtils.generateRandomKitchenHash();

      const existingInventory = await this.inventoryRepository.findOne({
        where: { kitchenHash: hash },
      });

      if (!existingInventory) {
        return hash;
      }

      attempts++;
    }

    throw new InternalServerErrorException(
      'Failed to generate unique kitchen hash after multiple attempts',
    );
  }
}
