// src/modules/auth/services/rate-limit-config.service.ts

import { Injectable } from '@nestjs/common';
import { UserRole } from '../dtos/roles.guards.dto';

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
		[UserRole.BASIC]: {
			maxRequests: 1000,
			windowSizeInSeconds: 3600, // 1k per hour
			tokenCurrentLimit: 10000, // Limit for users
			tokenExpirationDays: 30 // Token valid for 30 days
		}
	};

	getRateLimit(role: UserRole): RateLimitConfig {
		return this.rateLimits[role];
	}
}
