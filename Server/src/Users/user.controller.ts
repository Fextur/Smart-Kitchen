import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  JoinInventoryDto,
  LoginUserDto,
  UpdateUserDto,
} from './user.dto';
import { User } from './user.entity';

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

  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<Omit<User, 'password'>> {
    return this.userService.login(loginUserDto);
  }

  @Post('join-to-inventory')
  async joinToInventory(@Body() joinInventoryDto: JoinInventoryDto) {
    return this.userService.joinToInventory(joinInventoryDto);
  }
}
