// src/auth/guards/token-rate-limit.guard.ts

import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { format } from 'date-fns';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../public.decorator';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TokenRateLimitGuard implements CanActivate {
	private readonly logger = new Logger(TokenRateLimitGuard.name);
	private readonly maxRequests = 10000; // Set your desired limit
	private readonly windowSizeInSeconds = 3600; // 1 hour

	constructor(
		private readonly authService: AuthService,
		private readonly redisService: RedisService,
		private readonly reflector: Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const response = context.switchToHttp().getResponse();
		const clientId = request.headers['clientid'];
		const token = request.headers['authorization']?.replace('Bearer ', '');

		if (!clientId || !token) {
			this.logger.warn('ClientId or token missing in request');
			throw new HttpException('ClientId and token are required', HttpStatus.UNAUTHORIZED);
		}

		const isValid = await this.authService.validateToken(clientId, token);
		if (!isValid) {
			this.logger.warn('Invalid clientId or token');
			throw new HttpException('Invalid clientId or token', HttpStatus.UNAUTHORIZED);
		}

		const key = `token-rate-limit:${clientId}`;
		const currentCount = await this.redisService.redis.incr(key);

		if (currentCount === 1) {
			await this.redisService.redis.expire(key, this.windowSizeInSeconds);
		}

		const ttl = await this.redisService.redis.ttl(key);
		const resetTimestamp = Math.floor(Date.now() / 1000) + ttl;
		const formattedResetTime = format(new Date(resetTimestamp * 1000), 'EEE d MMM HH:mm');
		const remaining = Math.max(this.maxRequests - currentCount, 0);

		response.set('X-RateLimit-Limit', this.maxRequests.toString());
		response.set('X-RateLimit-Remaining', remaining.toString());
		response.set('X-RateLimit-Reset', formattedResetTime);

		if (currentCount > this.maxRequests) {
			this.logger.warn(`ClientId ${clientId} has exceeded the rate limit`);
			throw new HttpException('Too many requests, please try again later.', HttpStatus.TOO_MANY_REQUESTS);
		}

		return true;
	}
}
