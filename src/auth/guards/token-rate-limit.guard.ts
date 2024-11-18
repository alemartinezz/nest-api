// src/auth/guards/token-rate-limit.guard.ts

import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { format } from 'date-fns';
import { Request } from 'express';
import { UserRole } from 'src/dto/user/roles.enum';
import { RedisService } from '../../database/redis/redis.service';
import { UserDocument } from '../../database/schemas/user.schema';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../public.decorator';
import { RateLimitConfigService } from './rate-limit-config.service';

@Injectable()
export class TokenRateLimitGuard implements CanActivate {
	private readonly logger = new Logger(TokenRateLimitGuard.name);
	private readonly TOKEN_REGEX = /^[a-f0-9]{32}$/i; // 32-character hexadecimal

	constructor(
		private readonly authService: AuthService,
		private readonly redisService: RedisService,
		private readonly reflector: Reflector,
		private readonly rateLimitConfigService: RateLimitConfigService
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const isPublic = this.reflector.get<boolean>(
				IS_PUBLIC_KEY,
				context.getHandler()
			);

			const request = context.switchToHttp().getRequest<Request>();
			const response = context.switchToHttp().getResponse();
			const authHeader = request.headers['authorization'];

			if (!authHeader) {
				if (isPublic) {
					request.user = { role: UserRole.GUEST }; // Assign Guest role to unauthenticated users
					return true;
				}
				this.logger.warn('Authorization header missing');
				throw new HttpException(
					'Authorization header is required',
					HttpStatus.UNAUTHORIZED
				);
			}

			const token = authHeader.replace('Bearer ', '').trim();

			// Validate token format
			if (!this.TOKEN_REGEX.test(token)) {
				this.logger.warn(`Invalid token format: ${token}`);
				throw new HttpException(
					'Invalid token',
					HttpStatus.UNAUTHORIZED
				);
			}

			// Find user by token
			const user = await this.authService.getUser({ token });
			if (!user) {
				this.logger.warn('Invalid token');
				throw new HttpException(
					'Invalid token',
					HttpStatus.UNAUTHORIZED
				);
			}

			// Skip token expiration and usage checks for SUPER role
			if (user.role !== 'super') {
				// Check token expiration
				if (
					user.tokenExpiration &&
					user.tokenExpiration < new Date()
				) {
					this.logger.warn(
						`Token ${user.token} has expired for user ${user.email}`
					);
					throw new HttpException(
						'Token has expired.',
						HttpStatus.UNAUTHORIZED
					);
				}

				// Enforce token usage limits
				if (user.tokenCurrentUsage >= user.tokenCurrentLimit) {
					this.logger.warn(
						`Token ${user.token} has reached its usage limit for user ${user.email}`
					);
					throw new HttpException(
						'Token usage limit exceeded.',
						HttpStatus.TOO_MANY_REQUESTS
					);
				}

				// Increment usage counters
				await this.incrementTokenUsage(user);
			}

			request.user = user; // Set the user in the request object

			const { role } = user;

			// Get rate limits based on user role
			const rateLimitConfig =
				this.rateLimitConfigService.getRateLimit(role);

			const { maxRequests, windowSizeInSeconds } = rateLimitConfig;

			const key = `token-rate-limit:${user.token}`;

			// Skip rate limiting for SUPER role
			if (role !== 'super') {
				const currentCount = await this.redisService.redis.incr(key);

				if (currentCount === 1) {
					await this.redisService.redis.expire(
						key,
						windowSizeInSeconds
					);
				}

				const ttl = await this.redisService.redis.ttl(key);
				const resetTimestamp = Math.floor(Date.now() / 1000) + ttl;
				const formattedResetTime = format(
					new Date(resetTimestamp * 1000),
					'EEE d MMM HH:mm:ss'
				);
				const remaining = Math.max(maxRequests - currentCount, 0);

				// Set response headers
				response.set('X-RateLimit-Limit', maxRequests.toString());
				response.set('X-RateLimit-Remaining', remaining.toString());
				response.set('X-RateLimit-Reset', formattedResetTime);

				// Set custom headers for token usage
				const tokenCurrentLeft =
					user.tokenCurrentLimit - user.tokenCurrentUsage;
				response.set(
					'X-Token-Current-Limit',
					user.tokenCurrentLimit.toString()
				);
				response.set(
					'X-Token-Current-Usage',
					user.tokenCurrentUsage.toString()
				);
				response.set(
					'X-Token-Current-Left',
					tokenCurrentLeft.toString()
				);
				response.set(
					'X-Token-Expiration',
					user.tokenExpiration
						? user.tokenExpiration.toISOString()
						: ''
				);

				if (currentCount > maxRequests) {
					this.logger.warn(
						`Token ${user.token} with role ${role} has exceeded the rate limit`
					);
					throw new HttpException(
						'Too many requests, please try again later.',
						HttpStatus.TOO_MANY_REQUESTS
					);
				}
			} else {
				// For super user, set headers indicating unlimited access
				response.set('X-RateLimit-Limit', 'unlimited');
				response.set('X-RateLimit-Remaining', 'unlimited');
				response.set('X-RateLimit-Reset', 'never');
			}

			return true;
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			this.logger.error('Error in TokenRateLimitGuard', error);
			throw new HttpException(
				'Internal server error in token rate limiting',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}

	private async incrementTokenUsage(user: UserDocument): Promise<void> {
		user.tokenTotalUsage = (user.tokenTotalUsage || 0) + 1;
		user.tokenCurrentUsage = (user.tokenCurrentUsage || 0) + 1;
		try {
			await user.save();
		} catch (error) {
			this.logger.error(
				`Error updating token usage for user ${user.email}`,
				error
			);
			throw new HttpException(
				'Internal server error while updating token usage',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
