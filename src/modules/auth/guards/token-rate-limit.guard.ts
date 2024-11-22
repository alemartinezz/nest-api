// src/modules/auth/guards/token-rate-limit.guard.ts

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
import { Request, Response } from 'express';
import { IS_PUBLIC_KEY } from 'src/modules/auth/decorators/public.decorator';
import { UserRole } from 'src/modules/auth/dtos/roles.enum';
import { AuthService } from 'src/modules/auth/services/auth.service';
import {
	RateLimitConfig,
	RateLimitConfigService
} from 'src/modules/auth/services/rate-limit-config.service';
import { UserDocument } from 'src/modules/mongoose/schemas/user.schema';

interface RateLimitInfo {
	count: number;
	resetTime: number; // Unix timestamp in seconds
}

@Injectable()
export class TokenRateLimitGuard implements CanActivate {
	private readonly logger = new Logger(TokenRateLimitGuard.name);
	private readonly TOKEN_REGEX: RegExp;
	private rateLimitMap: Map<string, RateLimitInfo> = new Map();

	constructor(
		private readonly configService: ConfigService,
		private readonly authService: AuthService,
		private readonly reflector: Reflector,
		private readonly rateLimitConfigService: RateLimitConfigService
	) {
		const tokenRegexString =
			this.configService.get<string>('TOKEN_REGEX');
		if (!tokenRegexString) {
			this.logger.error(
				'TOKEN_REGEX is not defined in the configuration.'
			);
			throw new Error('TOKEN_REGEX is required.');
		}
		this.TOKEN_REGEX = new RegExp(tokenRegexString);
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			const isPublic = this.reflector.get<boolean>(
				IS_PUBLIC_KEY,
				context.getHandler()
			);

			const ctx = context.switchToHttp();
			const request = ctx.getRequest<Request>();
			const response = ctx.getResponse<Response>();

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
			const rateLimitConfig: RateLimitConfig =
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

			// Rate limiting logic using in-memory Map
			const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
			const tokenRateLimitKey = `token-rate-limit:${user.token}`;
			let rateLimitInfo = this.rateLimitMap.get(tokenRateLimitKey);

			if (!rateLimitInfo || currentTime > rateLimitInfo.resetTime) {
				// Initialize or reset the rate limit window
				rateLimitInfo = {
					count: 1,
					resetTime: currentTime + windowSizeInSeconds
				};
				this.rateLimitMap.set(tokenRateLimitKey, rateLimitInfo);
			} else {
				// Increment the count within the current window
				rateLimitInfo.count += 1;
				this.rateLimitMap.set(tokenRateLimitKey, rateLimitInfo);
			}

			const remainingRequests =
				maxRequests === Infinity
					? 'unlimited'
					: Math.max(
							maxRequests - rateLimitInfo.count,
							0
						).toString();

			// Set response headers
			response.set(
				'X-RateLimit-Limit',
				maxRequests === Infinity
					? 'unlimited'
					: maxRequests.toString()
			);
			response.set('X-RateLimit-Remaining', remainingRequests);
			response.set(
				'X-RateLimit-Reset',
				maxRequests === Infinity
					? 'never'
					: format(
							new Date(rateLimitInfo.resetTime * 1000),
							'EEE d MMM HH:mm:ss'
						)
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
			if (rateLimitInfo.count > maxRequests) {
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
