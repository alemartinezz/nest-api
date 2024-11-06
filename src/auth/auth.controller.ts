// src/auth/auth.controller.ts

import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { userId: string; profileGroup: string }) {
    return this.authService.login(loginDto.userId, loginDto.profileGroup);
  }
}
