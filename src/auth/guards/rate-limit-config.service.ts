// src/auth/rate-limit.config.ts

import { Injectable } from '@nestjs/common';
import { UserRole } from '../../dto/user/roles.enum';

export interface RateLimitConfig {
	maxRequests: number;
	windowSizeInSeconds: number;
	tokenCurrentLimit: number;
	tokenExpirationDays: number;
}

@Injectable()
export class RateLimitConfigService {
	private readonly rateLimits: Record<UserRole, RateLimitConfig> = {
		[UserRole.SUPER]: {
			maxRequests: Infinity,
			windowSizeInSeconds: 0,
			tokenCurrentLimit: Infinity,
			tokenExpirationDays: Infinity
		},
		[UserRole.ADMIN]: {
			maxRequests: 10000,
			windowSizeInSeconds: 3600, // 10k per hour
			tokenCurrentLimit: 100000, // High limit for admins
			tokenExpirationDays: 365 // Token valid for 1 year
		},
		[UserRole.USER]: {
			maxRequests: 1000,
			windowSizeInSeconds: 3600, // 1k per hour
			tokenCurrentLimit: 10000, // Limit for users
			tokenExpirationDays: 30 // Token valid for 30 days
		},
		[UserRole.GUEST]: {
			maxRequests: 100,
			windowSizeInSeconds: 3600, // 100 per hour
			tokenCurrentLimit: 1000, // Limit for guests
			tokenExpirationDays: 7 // Token valid for 7 days
		}
	};

	getRateLimit(role: UserRole): RateLimitConfig {
		return this.rateLimits[role] || this.rateLimits[UserRole.GUEST];
	}
}
