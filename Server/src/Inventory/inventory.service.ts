import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async findById(id: string): Promise<Inventory> {
    try {
      const inventory = await this.inventoryRepository.find({
        where: { id },
        relations: ['users', 'products'],
      });
      if (!inventory) {
        throw new NotFoundException(`Inventory with id ${id} not found`);
      }
      return inventory[0];
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch inventory');
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
      const inventory = this.inventoryRepository.create(createInventoryDto);
      return await this.inventoryRepository.save(inventory);
    } catch (error) {
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
        throw new NotFoundException(`Inventory item with id ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete inventory item');
    }
  }
}
