import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import {
  CreateUserDto,
  JoinInventoryDto,
  LoginUserDto,
  UpdateUserDto,
} from './user.dto';
import { UnauthorizedException } from '@nestjs/common';
import { Inventory } from 'src/Inventory/inventory.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const { name, userName, email, password } = createUserDto;
      const hashedPassword = await bcrypt.hash(password, 10);

      const inventory = this.inventoryRepository.create({
        name: `המטבח של ${name}`,
      });

      const savedInventory = await this.inventoryRepository.save(inventory);

      const user = this.userRepository.create({
        name,
        userName,
        email,
        password: hashedPassword,
        inventory: savedInventory,
      });

      const savedUser = await this.userRepository.save(user);

      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const { id, name, userName, email, sensitivities } = updateUserDto;

      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }

      if (name !== undefined) user.name = name;
      if (userName !== undefined) user.userName = userName;
      if (email !== undefined) user.email = email;
      if (sensitivities !== undefined) user.sensitivities = sensitivities;

      const updatedUser = await this.userRepository.save(user);

      const { password: _, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['inventory'],
      });
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async getInventoryByUserId(userId: string): Promise<Inventory> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    if (!user.inventory) {
      throw new NotFoundException(
        `User with id ${userId} is not assigned to any inventory`,
      );
    }

    return user.inventory;
  }

  async findByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        return null;
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<Omit<User, 'password'>> {
    const { userName, password } = loginUserDto;

    try {
      const user = await this.userRepository.findOne({
        where: { userName },
        relations: ['inventory'],
      });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordMatches = await bcrypt.compare(password, user.password);
      if (!passwordMatches) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Login failed');
    }
  }

  async joinToInventory(joinDto: JoinInventoryDto): Promise<User> {
    const { userId, inventoryId } = joinDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const inventory = await this.inventoryRepository.findOneBy({
      id: inventoryId,
    });
    if (!inventory) {
      throw new NotFoundException(`Inventory with id ${inventoryId} not found`);
    }

    user.inventory = inventory;

    return this.userRepository.save(user);
  }
}
