// src/auth/guards/rate-limit.guard.ts

import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export abstract class RateLimitGuard implements CanActivate {
	protected abstract getKey(context: ExecutionContext): Promise<string>;
	protected abstract getLimit(context: ExecutionContext): Promise<number>;
	protected abstract getWindow(context: ExecutionContext): Promise<number>;

	protected readonly logger = new Logger(RateLimitGuard.name);

	constructor(protected readonly redisService: RedisService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const key = await this.getKey(context);
		if (!key) {
			return true;
		}

		const limit = await this.getLimit(context);
		const window = await this.getWindow(context);

		const currentCount = await this.redisService.redis.incr(key);
		if (currentCount === 1) {
			await this.redisService.redis.expire(key, window);
		}

		const ttl = await this.redisService.redis.ttl(key);
		const remaining = Math.max(limit - currentCount, 0);

		const response = context.switchToHttp().getResponse();
		response.set('X-RateLimit-Limit', limit.toString());
		response.set('X-RateLimit-Remaining', remaining.toString());
		response.set('X-RateLimit-Reset', new Date(Date.now() + ttl * 1000).toISOString());

		if (currentCount > limit) {
			this.logger.warn(`Rate limit exceeded for key: ${key}`);
			throw new HttpException('Too many requests, please try again later.', HttpStatus.TOO_MANY_REQUESTS);
		}

		return true;
	}
}
