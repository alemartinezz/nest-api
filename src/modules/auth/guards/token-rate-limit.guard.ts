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
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { IS_PUBLIC_KEY } from 'src/modules/auth/decorators/public.decorator';
import {
	RateLimitConfig,
	RateLimitConfigService
} from 'src/modules/auth/services/rate-limit-config.service';
import {
	User,
	UserDocument
} from 'src/modules/mongoose/schemas/user.schema';
import { RedisService } from '../../redis/redis.service';
import { UserRole } from '../dtos/roles.guards.dto';

@Injectable()
export class TokenRateLimitGuard implements CanActivate {
	private readonly logger = new Logger(TokenRateLimitGuard.name);
	private readonly TOKEN_REGEX: RegExp;
	private rateLimiter: RateLimiterRedis;

	constructor(
		private readonly configService: ConfigService,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		private readonly reflector: Reflector,
		private readonly rateLimitConfigService: RateLimitConfigService,
		private readonly redisService: RedisService
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

		const redisClient = this.redisService.getClient();

		this.rateLimiter = new RateLimiterRedis({
			storeClient: redisClient,
			keyPrefix: 'token'
		});
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_KEY,
			[context.getHandler(), context.getClass()]
		);

		const ctx = context.switchToHttp();

		const request = ctx.getRequest<Request>();

		const response = ctx.getResponse<Response>();

		try {
			const authHeader = this.getAuthHeader(request);

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

			const token = this.extractToken(authHeader);

			this.validateTokenFormat(token);

			const user = await this.findUserByToken(token);

			request.user = user;

			const { role } = user;

			const rateLimitConfig =
				this.rateLimitConfigService.getRateLimit(role);

			if (role === UserRole.SUPER) {
				await this.handleSuperUser(user, response);

				return true;
			}

			await this.handleRegularUser(user, rateLimitConfig, response);

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

	private getAuthHeader(request: Request): string | undefined {
		return request.headers['authorization'];
	}

	private extractToken(authHeader: string): string {
		return authHeader.replace('Bearer ', '').trim();
	}

	private validateTokenFormat(token: string): void {
		if (!this.TOKEN_REGEX.test(token)) {
			this.logger.warn(`Invalid token format: ${token}`);

			throw new HttpException(
				'Invalid token',
				HttpStatus.UNAUTHORIZED
			);
		}
	}

	private async findUserByToken(token: string): Promise<UserDocument> {
		const user = await this.userModel.findOne({ token });

		if (!user) {
			this.logger.warn('Invalid token');

			throw new HttpException(
				'Invalid token',
				HttpStatus.UNAUTHORIZED
			);
		}

		return user;
	}

	private async handleSuperUser(
		user: UserDocument,
		response: Response
	): Promise<void> {
		await this.incrementTokenTotalUsage(user);

		response.set('X-Token-RateLimit-Limit', 'unlimited');

		response.set('X-Token-RateLimit-Remaining', 'unlimited');

		response.set('X-Token-RateLimit-Reset', 'never');
	}

	private async handleRegularUser(
		user: UserDocument,
		rateLimitConfig: RateLimitConfig,
		response: Response
	): Promise<void> {
		const { tokenCurrentLimit } = rateLimitConfig;

		if (this.isTokenExpired(user)) {
			this.logger.warn(
				`Token ${user.token} has expired for user ${user.email}`
			);

			throw new HttpException(
				'Token has expired.',
				HttpStatus.UNAUTHORIZED
			);
		}

		if (this.hasExceededUsageLimit(user, tokenCurrentLimit)) {
			this.logger.warn(
				`Token ${user.token} has reached its usage limit for user ${user.email}`
			);

			throw new HttpException(
				'Token usage limit exceeded. Consider upgrading your plan. More info at: https://google.com/plans',
				HttpStatus.TOO_MANY_REQUESTS
			);
		}

		await this.incrementTokenUsage(user);

		await this.handleRateLimiting(user, rateLimitConfig, response);
	}

	private isTokenExpired(user: UserDocument): boolean {
		return user.tokenExpiration
			? user.tokenExpiration < new Date()
			: false;
	}

	private hasExceededUsageLimit(
		user: UserDocument,
		tokenCurrentLimit: number
	): boolean {
		return user.tokenCurrentUsage >= tokenCurrentLimit;
	}

	private async handleRateLimiting(
		user: UserDocument,
		rateLimitConfig: RateLimitConfig,
		response: Response
	): Promise<void> {
		const { maxRequests, windowSizeInSeconds } = rateLimitConfig;

		const tokenRateLimitKey = `token-rate-limit:${user.token}`;

		try {
			const rateLimiterRes = await this.rateLimiter.consume(
				tokenRateLimitKey,
				1,
				{
					points: maxRequests,
					duration: windowSizeInSeconds
				}
			);

			this.setResponseHeaders(
				user,
				rateLimitConfig,
				rateLimiterRes,
				response
			);
		} catch (rateLimiterRes) {
			if (rateLimiterRes instanceof RateLimiterRes) {
				response.set(
					'Retry-After',
					Math.ceil(rateLimiterRes.msBeforeNext / 1000).toString()
				);
			}

			this.logger.warn(
				`Token ${user.token} with role ${user.role} has exceeded the rate limit`
			);

			throw new HttpException(
				'Too many requests, please try again later.',
				HttpStatus.TOO_MANY_REQUESTS
			);
		}
	}

	private setResponseHeaders(
		user: UserDocument,
		rateLimitConfig: RateLimitConfig,
		rateLimiterRes: RateLimiterRes,
		response: Response
	): void {
		const { tokenCurrentLimit } = rateLimitConfig;

		const tokenCurrentLeft =
			tokenCurrentLimit === Infinity
				? 'unlimited'
				: Math.max(
						tokenCurrentLimit - user.tokenCurrentUsage,
						0
					).toString();

		response.set(
			'X-Token-RateLimit-Limit',
			tokenCurrentLimit === Infinity
				? 'unlimited'
				: tokenCurrentLimit.toString()
		);

		response.set('X-Token-RateLimit-Remaining', tokenCurrentLeft);

		response.set(
			'X-Token-RateLimit-Reset',
			rateLimiterRes.msBeforeNext
				? new Date(
						Date.now() + rateLimiterRes.msBeforeNext
					).toUTCString()
				: 'never'
		);
	}

	private async incrementTokenUsage(user: UserDocument): Promise<void> {
		user.tokenTotalUsage = (user.tokenTotalUsage ?? 0) + 1;

		user.tokenCurrentUsage = (user.tokenCurrentUsage ?? 0) + 1;

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
		user.tokenTotalUsage = (user.tokenTotalUsage ?? 0) + 1;

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
