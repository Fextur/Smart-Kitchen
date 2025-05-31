import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Inventory } from './inventory.entity';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';

@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('search')
  async findByName(@Query('name') name: string): Promise<Inventory[]> {
    if (!name) {
      throw new BadRequestException('Query parameter "name" is required');
    }
    return this.inventoryService.findByName(name);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Inventory> {
    return this.inventoryService.findById(id);
  }

  @Get()
  async findAll(): Promise<Inventory[]> {
    return this.inventoryService.findAll();
  }

  @Post()
  async create(
    @Body() createInventoryDto: CreateInventoryDto,
  ): Promise<Inventory> {
    return this.inventoryService.create(createInventoryDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    return this.inventoryService.update({ ...updateInventoryDto, id });
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.inventoryService.delete(id);
  }
}
