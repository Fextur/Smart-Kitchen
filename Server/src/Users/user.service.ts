import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import {
  CreateUserDto,
  JoinInventoryDto,
  LoginUserDto,
  UpdateUserDto,
  CreateKitchenDto,
  JoinKitchenDto,
} from './user.dto';
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
  }

  async update(updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const { id, name, userName, email, sensitivities, height, weight, goal, notes } = updateUserDto;

    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    Object.assign(user, { name, userName, email, sensitivities, height, weight, goal, notes });

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

  async findByEmail(email: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) return null;

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

  async login(loginUserDto: LoginUserDto): Promise<Omit<User, 'password'>> {
    const { userName, password } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { userName },
      relations: ['inventory'],
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async joinToInventory(joinDto: JoinInventoryDto): Promise<User> {
    const { userId, inventoryId } = joinDto;

    const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['inventory'] });
    const inventory = await this.inventoryRepository.findOneBy({ id: inventoryId });

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

    const newInventory = this.inventoryRepository.create({ name, users: [user] });
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
      relations: ['inventory', 'inventory.users'],
    });
    if (!user) throw new NotFoundException();

    const sharedUsers = user.inventory?.users
      ?.filter((u) => u.id !== user.id)
      .map((u) => u.email) || [];

    return {
      dietaryPreference: user.sensitivities?.[0] || 'none',
      sharedKitchenUsers: sharedUsers,
      height: user.height,
      weight: user.weight,
      goal: user.goal,
      notes: user.notes,
    };
  }

  async updateUserSettings(
    userId: string,
    settings: {
      dietaryPreference: string;
      sharedKitchenUsers: string[];
      height?: number;
      weight?: number;
      goal?: string;
      notes?: string;
    },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory', 'inventory.users'],
    });

    if (!user) throw new NotFoundException();

    user.sensitivities = [settings.dietaryPreference];
    if (settings.height !== undefined) user.height = settings.height;
    if (settings.weight !== undefined) user.weight = settings.weight;
    if (settings.goal !== undefined) user.goal = settings.goal;
    if (settings.notes !== undefined) user.notes = settings.notes;

    const sharedUsers = await this.userRepository.findBy({
      email: In(settings.sharedKitchenUsers),
    });

    const filteredUsers = sharedUsers.filter((u) => u.id !== user.id);
    user.inventory.users = [user, ...filteredUsers];

    await this.inventoryRepository.save(user.inventory);
    await this.userRepository.save(user);

    const { password, ...rest } = user;
    return rest;
  }
}
