// src/auth/guards/token-rate-limit.guard.ts

import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { format } from 'date-fns';
import { Request } from 'express';
import { UserDocument } from 'src/database/mongoose/schemas/user.schema';
import { UserRole } from 'src/users/dtos/roles.enum';
import { RedisService } from '../../database/redis/redis.service';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RateLimitConfigService } from '../services/rate-limit-config.service';

@Injectable()
export class TokenRateLimitGuard implements CanActivate {
	private readonly logger = new Logger(TokenRateLimitGuard.name);
	private readonly TOKEN_REGEX: RegExp;

	constructor(
		private readonly configService: ConfigService,
		private readonly authService: AuthService,
		private readonly redisService: RedisService,
		private readonly reflector: Reflector,
		private readonly rateLimitConfigService: RateLimitConfigService
	) {
		this.TOKEN_REGEX = new RegExp(
			this.configService.get<string>('TOKEN_REGEX')
		);
	}

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

			request.user = user; // Set the user in the request object

			const { role } = user;

			// Get rate limits based on user role
			const rateLimitConfig =
				this.rateLimitConfigService.getRateLimit(role);
			const {
				maxRequests,
				windowSizeInSeconds,
				tokenCurrentLimit,
				tokenExpirationDays
			} = rateLimitConfig;

			if (role === UserRole.SUPER) {
				// For SUPER users, only increment tokenTotalUsage
				await this.incrementTokenTotalUsage(user);

				// Set headers to indicate unlimited access
				response.set('X-RateLimit-Limit', 'unlimited');
				response.set('X-RateLimit-Remaining', 'unlimited');
				response.set('X-RateLimit-Reset', 'never');

				// Set custom headers for token usage
				response.set('X-Token-Current-Limit', 'unlimited');
				response.set(
					'X-Token-Current-Usage',
					user.tokenTotalUsage.toString()
				);
				response.set('X-Token-Current-Left', 'unlimited');
				response.set(
					'X-Token-Expiration',
					user.tokenExpiration
						? user.tokenExpiration.toISOString()
						: ''
				);

				return true;
			}

			// For non-SUPER users, perform rate limit checks

			// Check token expiration
			if (user.tokenExpiration && user.tokenExpiration < new Date()) {
				this.logger.warn(
					`Token ${user.token} has expired for user ${user.email}`
				);
				throw new HttpException(
					'Token has expired.',
					HttpStatus.UNAUTHORIZED
				);
			}

			// Enforce token usage limits
			if (user.tokenCurrentUsage >= tokenCurrentLimit) {
				this.logger.warn(
					`Token ${user.token} has reached its usage limit for user ${user.email}`
				);
				throw new HttpException(
					'Token usage limit exceeded. Consider upgrading your plan. More info at: https://google.com/plans',
					HttpStatus.TOO_MANY_REQUESTS
				);
			}

			// Increment usage counters
			await this.incrementTokenUsage(user);

			const key = `token-rate-limit:${user.token}`;

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
			const remaining =
				maxRequests === Infinity
					? 'unlimited'
					: Math.max(maxRequests - currentCount, 0).toString();

			// Set response headers
			response.set(
				'X-RateLimit-Limit',
				maxRequests === Infinity
					? 'unlimited'
					: maxRequests.toString()
			);
			response.set('X-RateLimit-Remaining', remaining);
			response.set(
				'X-RateLimit-Reset',
				maxRequests === Infinity ? 'never' : formattedResetTime
			);

			// Set custom headers for token usage
			const tokenCurrentLeft =
				tokenCurrentLimit === Infinity
					? 'unlimited'
					: (
							tokenCurrentLimit - user.tokenCurrentUsage
						).toString();
			response.set(
				'X-Token-Current-Limit',
				tokenCurrentLimit === Infinity
					? 'unlimited'
					: tokenCurrentLimit.toString()
			);
			response.set(
				'X-Token-Current-Usage',
				user.tokenCurrentUsage.toString()
			);
			response.set('X-Token-Current-Left', tokenCurrentLeft);
			response.set(
				'X-Token-Expiration',
				user.tokenExpiration
					? user.tokenExpiration.toISOString()
					: ''
			);

			// Check if currentCount exceeds maxRequests
			if (currentCount > maxRequests) {
				this.logger.warn(
					`Token ${user.token} with role ${role} has exceeded the rate limit`
				);
				throw new HttpException(
					'Too many requests, please try again later.',
					HttpStatus.TOO_MANY_REQUESTS
				);
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

	private async incrementTokenTotalUsage(
		user: UserDocument
	): Promise<void> {
		user.tokenTotalUsage = (user.tokenTotalUsage || 0) + 1;
		try {
			await user.save();
		} catch (error) {
			this.logger.error(
				`Error updating tokenTotalUsage for user ${user.email}`,
				error
			);
			throw new HttpException(
				'Internal server error while updating token usage',
				HttpStatus.INTERNAL_SERVER_ERROR
			);
		}
	}
}
