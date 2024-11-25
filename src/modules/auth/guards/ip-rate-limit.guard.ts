// src/modules/auth/guards/ip-rate-limit.guard.ts

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
import { Request, Response } from 'express';

@Injectable()
export class IpRateLimitGuard implements CanActivate {
	private readonly logger = new Logger(IpRateLimitGuard.name);
	private ipRateLimitMap: Map<
		string,
		{ count: number; resetTime: number }
	> = new Map();

	private readonly maxRequests: number;
	private readonly windowSizeInSeconds: number;

	constructor(
		private readonly configService: ConfigService,
		private readonly reflector: Reflector
	) {
		this.maxRequests =
			this.configService.get<number>('IP_RATE_LIMIT_MAX');
		this.windowSizeInSeconds = this.configService.get<number>(
			'IP_RATE_LIMIT_WINDOW'
		);
	}

	canActivate(context: ExecutionContext): boolean {
		const ctx = context.switchToHttp();
		const request = ctx.getRequest<Request>();
		const response = ctx.getResponse<Response>();

		const ipAddress = request.ip || request.connection.remoteAddress;

		const currentTime = Math.floor(Date.now() / 1000);
		const ipRateLimitKey = `ip-rate-limit:${ipAddress}`;

		let rateLimitInfo = this.ipRateLimitMap.get(ipRateLimitKey);

		if (!rateLimitInfo || currentTime > rateLimitInfo.resetTime) {
			rateLimitInfo = {
				count: 1,
				resetTime: currentTime + this.windowSizeInSeconds
			};
			this.ipRateLimitMap.set(ipRateLimitKey, rateLimitInfo);
		} else {
			rateLimitInfo.count += 1;
		}

		if (rateLimitInfo.count > this.maxRequests) {
			this.logger.warn(`IP ${ipAddress} has exceeded the rate limit`);
			throw new HttpException(
				'Too many requests from this IP, please try again later.',
				HttpStatus.TOO_MANY_REQUESTS
			);
		}

		const remainingRequests = Math.max(
			this.maxRequests - rateLimitInfo.count,
			0
		);
		response.set('X-IP-RateLimit-Limit', this.maxRequests.toString());
		response.set(
			'X-IP-RateLimit-Remaining',
			remainingRequests.toString()
		);
		response.set(
			'X-IP-RateLimit-Reset',
			new Date(rateLimitInfo.resetTime * 1000).toISOString()
		);

		return true;
	}
}
