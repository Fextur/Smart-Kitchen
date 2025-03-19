import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/Products/product.entity';
import { User } from 'src/Users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, User])],
})
export class UserModule {}
