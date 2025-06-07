import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Users/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Inventory } from 'src/Inventory/inventory.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Inventory]),
    JwtModule.register({
      secret: process.env.TOKEN_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRES },
    }),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
