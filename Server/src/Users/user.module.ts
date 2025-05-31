import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Users/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Inventory } from 'src/Inventory/inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Inventory])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
