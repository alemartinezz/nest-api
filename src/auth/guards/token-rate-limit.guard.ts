// src/auth/token-rate-limit.guard.ts

import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../public.decorator';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TokenRateLimitGuard implements CanActivate {
	private readonly logger = new Logger(TokenRateLimitGuard.name);

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
		const tokenHeader = request.headers['authorization'];
		if (!tokenHeader) {
			this.logger.warn('No token provided in request');
			throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
		}

		const token = tokenHeader.replace('Bearer ', '');
		if (!this.authService.verifyToken(token)) {
			this.logger.warn('Invalid token');
			throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
		}

		const tokenKey = `token-rate-limit:${token}`;
		let tokenData = await this.redisService.redis.hgetall(tokenKey);

		if (Object.keys(tokenData).length === 0) {
			const tokenDoc = await this.authService.findToken(token);

			if (!tokenDoc) {
				this.logger.warn('Token not found in database');
				throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
			}

			const timeRemaining = Math.ceil((tokenDoc.renewAt.getTime() - Date.now()) / 1000);

			if (timeRemaining <= 0) {
				this.logger.warn('Token rate limit period has expired');
				throw new HttpException('Token rate limit period has expired', HttpStatus.FORBIDDEN);
			}

			await this.redisService.redis.hmset(tokenKey, {
				requestsRemaining: tokenDoc.requestsRemaining.toString(),
				maxRequests: tokenDoc.maxRequests.toString(),
				windowSizeInSeconds: tokenDoc.windowSizeInSeconds.toString(),
				expireAt: tokenDoc.renewAt.getTime().toString()
			});
			await this.redisService.redis.expire(tokenKey, timeRemaining);
			tokenData = await this.redisService.redis.hgetall(tokenKey);
		}

		let requestsRemaining = parseInt(tokenData.requestsRemaining, 10);
		const maxRequests = parseInt(tokenData.maxRequests, 10);
		const windowSizeInSeconds = parseInt(tokenData.windowSizeInSeconds, 10);
		const expireAt = parseInt(tokenData.expireAt, 10);

		response.set('X-RateLimit-Limit', maxRequests.toString());
		response.set('X-RateLimit-Remaining', requestsRemaining.toString());
		response.set('X-RateLimit-Reset', Math.floor(expireAt / 1000).toString());

		if (requestsRemaining <= 0) {
			this.logger.warn('Token has exhausted its request limit');
			throw new HttpException('Token has exhausted its request limit, please wait until the limit resets', HttpStatus.TOO_MANY_REQUESTS);
		}

		requestsRemaining -= 1;
		await this.redisService.redis.hset(tokenKey, 'requestsRemaining', requestsRemaining.toString());

		response.set('X-RateLimit-Remaining', requestsRemaining.toString());

		return true;
	}
}
