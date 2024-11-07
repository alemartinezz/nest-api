// .//src/auth/ip-rate-limit.guard.ts

import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class IpRateLimitGuard implements CanActivate {
	private readonly logger = new Logger(IpRateLimitGuard.name);
	private readonly maxRequests: number;
	private readonly windowSizeInSeconds: number;

	constructor(
		private readonly redisService: RedisService,
		private readonly configService: ConfigService
	) {
		this.maxRequests = this.configService.get<number>('IP_RATE_LIMIT_MAX', 100);
		this.windowSizeInSeconds = this.configService.get<number>('IP_RATE_LIMIT_WINDOW', 60);
	}

	/**
	 * Checks if the IP has exceeded the rate limit.
	 */
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const ip = request.ip || request.connection.remoteAddress;

		const key = `ip-rate-limit:${ip}`;

		const currentCount = await this.redisService.redis.incr(key);

		if (currentCount === 1) {
			// Set the expiration if this is the first request
			await this.redisService.redis.expire(key, this.windowSizeInSeconds);
		}

		if (currentCount > this.maxRequests) {
			this.logger.warn(`IP ${ip} has exceeded the rate limit`);
			throw new HttpException('Too many requests from this IP, please try again after some time.', HttpStatus.TOO_MANY_REQUESTS);
		}

		return true;
	}
}
