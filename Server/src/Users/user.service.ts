import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
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
  JoinKitchenByHashDto,
  UserWithToken,
} from './user.dto';
import { Inventory } from 'src/Inventory/inventory.entity';
import { JwtService } from '@nestjs/jwt';
import { KitchenHashUtils } from 'src/utils/kitchenHashUtils';
import { EventsService, EventTypes } from '../Events/events.service';
import { AlertType } from '../types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,

    private jwtService: JwtService,
    
    private eventsService: EventsService,
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

      const kitchenHash = await this.generateUniqueKitchenHash();
      const kitchenName = `המטבח של ${name}`;

      const inventory = this.inventoryRepository.create({
        name: kitchenName,
        kitchenHash,
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
        // Emit kitchen creation event for new user's default kitchen
      this.eventsService.emitEvent(EventTypes.ADD_KITCHEN, {
        type: AlertType.ADD_KITCHEN,
        userId: savedUser.id,
        title: 'מטבח חדש נוצר',
        description: `המטבח "${kitchenName}" נוצר בהצלחה`,
        metadata: {
          kitchenName,
          kitchenHash: savedInventory.kitchenHash
        }
      });

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

  async createKitchen(dto: CreateKitchenDto): Promise<{
    inventory: Inventory;
    kitchenHash: string;
  }> {
    const { userId, name } = dto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    const kitchenHash = await this.generateUniqueKitchenHash();

    const newInventory = this.inventoryRepository.create({
      name,
      kitchenHash,
      users: [user],
    });
    const savedInventory = await this.inventoryRepository.save(newInventory);

    user.inventory = savedInventory;
    await this.userRepository.save(user);
      // Emit kitchen creation event
    this.eventsService.emitEvent(EventTypes.ADD_KITCHEN, {
      type: AlertType.ADD_KITCHEN,
      userId: user.id,
      title: 'מטבח חדש נוצר',
      description: `המטבח "${name}" נוצר בהצלחה`,
      metadata: {
        kitchenName: name,
        kitchenHash: savedInventory.kitchenHash
      }
    });

    return {
      inventory: savedInventory,
      kitchenHash: savedInventory.kitchenHash,
    };
  }

  async joinKitchenByHash(dto: JoinKitchenByHashDto): Promise<{
    success: boolean;
    inventory?: Inventory;
    message: string;
  }> {
    const { userId, kitchenHash } = dto;

    if (!KitchenHashUtils.isValidHashFormat(kitchenHash)) {
      throw new BadRequestException('Invalid kitchen code format');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const targetInventory = await this.inventoryRepository.findOne({
      where: { kitchenHash },
    });

    if (!targetInventory) {
      return {
        success: false,
        message: 'Kitchen not found. Please check the code and try again.',
      };
    }

    user.inventory = targetInventory;
    await this.userRepository.save(user);
      // Emit user entered kitchen event
    this.eventsService.emitEvent(EventTypes.USER_ENTERED_KITCHEN, {
      type: AlertType.USER_ENTERED_KITCHEN,
      userId, // Alert will be created for the user who joined
      title: 'נכנסת למטבח חדש',
      description: `נכנסת למטבח: ${targetInventory.name}`,
      relatedUserId: userId,
      relatedUserName: user.name,
      metadata: {
        kitchenName: targetInventory.name,
        kitchenHash: targetInventory.kitchenHash
      }
    });

    return {
      success: true,
      inventory: targetInventory,
      message: `Successfully joined kitchen: ${targetInventory.name}`,
    };
  }

  async getKitchenHash(
    userId: string,
  ): Promise<{ kitchenHash: string; kitchenName: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });

    if (!user || !user.inventory) {
      throw new NotFoundException(`User or inventory not found`);
    }

    return {
      kitchenHash: user.inventory.kitchenHash,
      kitchenName: user.inventory.name || 'Unnamed Kitchen',
    };
  }

  async getUserSettings(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['inventory'],
    });
    if (!user) throw new NotFoundException();

    return {
      kitchenName: user.inventory?.name || '',
      kitchenHash: user.inventory?.kitchenHash || '',
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

    user.sensitivities = settings.dietaryPreference
      ? settings.dietaryPreference.split(',').filter(Boolean)
      : [];
    user.height = settings.height;
    user.weight = settings.weight;
    user.goal = settings.goal;
    user.notes = settings.notes;

    await this.userRepository.save(user);

    const { password, ...rest } = user;
    return rest;
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
