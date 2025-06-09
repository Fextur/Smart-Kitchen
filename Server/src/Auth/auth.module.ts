import { JwtModule, JwtService } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/Users/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/Users/user.entity';
import { Inventory } from 'src/Inventory/inventory.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Inventory]),
    JwtModule.register({
      secret: process.env.TOKEN_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRES },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtService], // Add JwtService to providers
})
export class AuthModule {}
