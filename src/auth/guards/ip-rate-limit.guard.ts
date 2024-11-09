// src/auth/guards/ip-rate-limit.guard.ts

import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';
import { RateLimitGuard } from './rate-limit.guard';

@Injectable()
export class IpRateLimitGuard extends RateLimitGuard {
	constructor(
		redisService: RedisService,
		private readonly configService: ConfigService
	) {
		super(redisService);
	}

	async getKey(context: ExecutionContext): Promise<string> {
		const request = context.switchToHttp().getRequest();
		const ip = request.ip || request.connection.remoteAddress;
		return `ip-rate-limit:${ip}`;
	}

	async getLimit(context: ExecutionContext): Promise<number> {
		return this.configService.get<number>('IP_RATE_LIMIT_MAX', 100);
	}

	async getWindow(context: ExecutionContext): Promise<number> {
		return this.configService.get<number>('IP_RATE_LIMIT_WINDOW', 60);
	}
}
