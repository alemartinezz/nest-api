// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { TokenService } from './mongo/token.service';

@Injectable()
export class AuthService {
  constructor(private readonly tokenService: TokenService) {}

  async login(
    userId: string,
    profileGroup: string,
  ): Promise<{ token: string }> {
    const token = this.generateToken();
    const rateLimit = this.getRateLimitForProfileGroup(profileGroup);
    const expiresIn = 24 * 60 * 60;

    await this.tokenService.createToken(
      token,
      userId,
      expiresIn,
      profileGroup,
      rateLimit,
    );

    return { token };
  }

  private generateToken(): string {
    return 'random-token-string';
  }

  private getRateLimitForProfileGroup(profileGroup: string): number {
    const rateLimits = {
      basic: 100,
      premium: 1000,
      admin: 10000,
    };
    return rateLimits[profileGroup] || rateLimits['basic'];
  }
}
