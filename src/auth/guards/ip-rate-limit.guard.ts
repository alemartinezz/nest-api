// src/auth/guards/ip-rate-limit.guard.ts

import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { format } from 'date-fns';
import { RedisService } from '../../database/redis/redis.service';

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

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const request = context.switchToHttp().getRequest();
			const response = context.switchToHttp().getResponse();
			const ip = request.ip || request.connection.remoteAddress;

			const key = `ip-rate-limit:${ip}`;
			const currentCount = await this.redisService.redis.incr(key);

			if (currentCount === 1) {
				await this.redisService.redis.expire(key, this.windowSizeInSeconds);
			}

			const ttl = await this.redisService.redis.ttl(key);
			const resetTimestamp = Math.floor(Date.now() / 1000) + ttl;
			const formattedResetTime = format(new Date(resetTimestamp * 1000), 'EEE d MMM HH:mm:ss');
			const remaining = Math.max(this.maxRequests - currentCount, 0);

			response.set('X-RateLimit-Limit', this.maxRequests.toString());
			response.set('X-RateLimit-Remaining', remaining.toString());
			response.set('X-RateLimit-Reset', formattedResetTime);

			if (currentCount > this.maxRequests) {
				this.logger.warn(`IP ${ip} has exceeded the rate limit`);
				throw new HttpException('Too many requests from this IP, please try again later.', HttpStatus.TOO_MANY_REQUESTS);
			}

			return true;
		} catch (error) {
			this.logger.error('Error in IpRateLimitGuard', error);
			throw new HttpException('Internal server error in rate limiting', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
