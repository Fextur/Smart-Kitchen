import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  JoinInventoryDto,
  LoginUserDto,
  UpdateUserDto,
} from './user.dto';
import { User } from './user.entity';
import { Inventory } from 'src/Inventory/inventory.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.userService.create(createUserDto);
  }

  @Put()
  async update(
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.userService.update(updateUserDto);
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
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.userService.login(loginUserDto);
  }

  @Post('validate-token')
  async validateToken(
    @Body() { accessToken }: { accessToken: string },
  ): Promise<Omit<User, 'password'>> {
    return this.userService.validateToken(accessToken);
  }

  @Post('join-to-inventory')
  async joinToInventory(@Body() joinInventoryDto: JoinInventoryDto) {
    return this.userService.joinToInventory(joinInventoryDto);
  }
}
