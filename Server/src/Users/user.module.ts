import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/Products/product.entity';
import { User } from 'src/Users/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
