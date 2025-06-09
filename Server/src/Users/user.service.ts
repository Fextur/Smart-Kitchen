import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
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
  CreateKitchenDto,
  JoinKitchenDto,
  UserWithToken,
} from './user.dto';
import { Inventory } from 'src/Inventory/inventory.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,

    private jwtService: JwtService,
  ) {}

  async generateAccessToken(id: User['id'], userName: User['userName']) {
    const payload = {
      sub: id,
      userName: userName,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.TOKEN_SECRET,
      expiresIn: process.env.TOKEN_EXPIRES,
    });

    return accessToken;
  }

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Omit<UserWithToken, 'password'>> {
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
      const accessToken = await this.generateAccessToken(
        savedUser.id,
        savedUser.userName,
      );

      const { password: _, ...userWithoutPassword } = savedUser;
      return { ...userWithoutPassword, accessToken };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async update(updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const {
      id,
      name,
      userName,
      email,
      sensitivities,
      height,
      weight,
      goal,
      notes,
    } = updateUserDto;

    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    Object.assign(user, {
      name,
      userName,
      email,
      sensitivities,
      height,
      weight,
      goal,
      notes,
    });

    const updatedUser = await this.userRepository.save(user);
    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['inventory'],
    });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getInventoryByUserId(userId: string): Promise<Inventory> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });

    if (!user || !user.inventory) {
      throw new NotFoundException(`Inventory for user ${userId} not found`);
    }

    return user.inventory;
  }

  async findByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['inventory'],
      });

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

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<Omit<UserWithToken, 'password'>> {
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

      const accessToken = await this.generateAccessToken(
        user.id,
        user.userName,
      );

      const { password: _, ...userWithoutPassword } = user;

      return { ...userWithoutPassword, accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Login failed');
    }
  }

  async validateToken(accessToken: string): Promise<Omit<User, 'password'>> {
    const payload = this.jwtService.verify(accessToken, {
      secret: process.env.TOKEN_SECRET,
    });

    const id = payload.sub;

    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['inventory'],
      });
      if (!user) {
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
    const inventory = await this.inventoryRepository.findOneBy({
      id: inventoryId,
    });

    if (!user || !inventory) throw new NotFoundException();

    user.inventory = inventory;
    return this.userRepository.save(user);
  }

  async createKitchen(dto: CreateKitchenDto): Promise<Inventory> {
    const { userId, name } = dto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const newInventory = this.inventoryRepository.create({
      name,
      users: [user],
    });
    const savedInventory = await this.inventoryRepository.save(newInventory);

    user.inventory = savedInventory;
    await this.userRepository.save(user);

    return savedInventory;
  }

  async joinToKitchen(dto: JoinKitchenDto): Promise<User> {
    const { userId, kitchenName } = dto;

    const user = await this.userRepository.findOneBy({ id: userId });
    const inventory = await this.inventoryRepository.findOne({
      where: { name: kitchenName },
      relations: ['users'],
    });

    if (!user || !inventory) throw new NotFoundException();

    inventory.users.push(user);
    await this.inventoryRepository.save(inventory);

    user.inventory = inventory;
    return this.userRepository.save(user);
  }

  async getUserSettings(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });
    if (!user) throw new NotFoundException();

    return {
      kitchenName: user.inventory?.name || '',
      weight: user.weight || 0,
      height: user.height || 0,
      goal: user.goal || '',
      dietaryPreference: user.sensitivities?.join(',') || '',
      notes: user.notes || '',
    };
  }

  async updateUserSettings(
    userId: string,
    settings: {
      kitchenName: string;
      weight: number;
      height: number;
      goal: string;
      dietaryPreference: string;
      notes: string;
    },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });

    if (!user) throw new NotFoundException();

    // Update user properties
    // Convert comma-separated string back to array
    user.sensitivities = settings.dietaryPreference
      ? settings.dietaryPreference.split(',').filter(Boolean)
      : [];
    user.height = settings.height;
    user.weight = settings.weight;
    user.goal = settings.goal;
    user.notes = settings.notes;

    // Update kitchen name if provided
    if (settings.kitchenName && user.inventory) {
      user.inventory.name = settings.kitchenName;
      await this.inventoryRepository.save(user.inventory);
    }

    await this.userRepository.save(user);

    const { password, ...rest } = user;
    return rest;
  }
}
