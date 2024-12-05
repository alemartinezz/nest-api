import {
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	Logger
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class IpRateLimitGuard implements CanActivate {
	private readonly logger = new Logger(IpRateLimitGuard.name);
	private readonly maxRequests: number;
	private readonly windowSizeInSeconds: number;
	private rateLimiter: RateLimiterRedis;
	constructor(
		private readonly configService: ConfigService,
		private readonly reflector: Reflector,
		private readonly redisService: RedisService
	) {
		this.maxRequests = this.configService.get<number>('IP_RATE_LIMIT_MAX');

		this.windowSizeInSeconds = this.configService.get<number>(
			'IP_RATE_LIMIT_WINDOW'
		);

		const redisClient = this.redisService.getClient();

		this.rateLimiter = new RateLimiterRedis({
			storeClient: redisClient,
			keyPrefix: 'ip',
			points: this.maxRequests,
			duration: this.windowSizeInSeconds
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
		const ipAddress = request.ip || request.connection.remoteAddress;

		try {
			if (!isPublic) {
				const rateLimiterRes =
					await this.rateLimiter.consume(ipAddress);

				response.set(
					'X-IP-RateLimit-Limit',
					this.maxRequests.toString()
				);

				response.set(
					'X-IP-RateLimit-Remaining',
					rateLimiterRes.remainingPoints.toString()
				);

				response.set(
					'X-IP-RateLimit-Reset',
					new Date(
						Date.now() + rateLimiterRes.msBeforeNext
					).toUTCString()
				);
			}

			return true;
		} catch (rateLimiterRes) {
			if (rateLimiterRes instanceof RateLimiterRes) {
				response.set(
					'Retry-After',
					Math.ceil(rateLimiterRes.msBeforeNext / 1000).toString()
				);
			}

			this.logger.warn(`IP ${ipAddress} has exceeded the rate limit`);

			throw new HttpException(
				'Too many requests from this IP, please try again later.',
				HttpStatus.TOO_MANY_REQUESTS
			);
		}
	}
}
