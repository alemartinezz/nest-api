// src/auth/rate-limit.config.ts

import { Injectable } from '@nestjs/common';
import { UserRole } from '../../dto/user/roles.enum';

export interface RateLimitConfig {
	maxRequests: number;
	windowSizeInSeconds: number;
}

@Injectable()
export class RateLimitConfigService {
	private readonly rateLimits: Record<UserRole, RateLimitConfig> = {
		[UserRole.ADMIN]: { maxRequests: 10000, windowSizeInSeconds: 3600 }, // 10k por hora
		[UserRole.USER]: { maxRequests: 1000, windowSizeInSeconds: 3600 }, // 1k por hora
		[UserRole.GUEST]: { maxRequests: 100, windowSizeInSeconds: 3600 } // 100 por hora
	};

	getRateLimit(role: UserRole): RateLimitConfig {
		return this.rateLimits[role] || this.rateLimits[UserRole.GUEST];
	}
}
