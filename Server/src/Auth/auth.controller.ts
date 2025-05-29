import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('googleLogin')
  async create(@Body() { credential }: { credential: string }) {
    return this.authService.googleLogin(credential);
  }
}

