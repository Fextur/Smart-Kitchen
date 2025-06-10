import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  JoinInventoryDto,
  LoginUserDto,
  UpdateUserDto,
  CreateKitchenDto,
  JoinKitchenByHashDto,
} from './user.dto';
import { User } from './user.entity';
import { Inventory } from 'src/Inventory/inventory.entity';

type UserSettingsDto = {
  weight: number;
  height: number;
  goal: string;
  dietaryPreference: string;
  notes: string;
};

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id/settings')
  async getSettings(@Param('id') userId: string) {
    return this.userService.getUserSettings(userId);
  }

  @Put(':id/settings')
  async updateSettings(
    @Param('id') userId: string,
    @Body() body: UserSettingsDto,
  ) {
    return this.userService.updateUserSettings(userId, body);
  }

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    return this.userService.create(dto);
  }

  @Put()
  async update(@Body() dto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    return this.userService.update(dto);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Omit<User, 'password'>> {
    return this.userService.findById(id);
  }

  @Get(':userId/inventory')
  async getInventoryByUserId(
    @Param('userId') userId: string,
  ): Promise<Inventory> {
    return this.userService.getInventoryByUserId(userId);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<Omit<User, 'password'>> {
    return this.userService.login(dto);
  }

  @Post('validate-token')
  async validateToken(
    @Body() { accessToken }: { accessToken: string },
  ): Promise<Omit<User, 'password'>> {
    return this.userService.validateToken(accessToken);
  }

  @Post('create-kitchen')
  async createKitchen(@Body() dto: CreateKitchenDto) {
    return this.userService.createKitchen(dto);
  }

  @Post('join-kitchen-by-hash')
  async joinKitchenByHash(@Body() dto: JoinKitchenByHashDto) {
    return this.userService.joinKitchenByHash(dto);
  }

  @Get(':userId/kitchen-hash')
  async getKitchenHash(@Param('userId') userId: string) {
    return this.userService.getKitchenHash(userId);
  }

  @Post('logoutUser')
  async logout() {
    return { message: 'Logged out successfully' };
  }
}
