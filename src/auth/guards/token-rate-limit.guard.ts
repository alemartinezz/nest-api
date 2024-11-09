// src/auth/guards/token-rate-limit.guard.ts

import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { RedisService } from '../redis/redis.service';
import { RateLimitGuard } from './rate-limit.guard';

@Injectable()
export class TokenRateLimitGuard extends RateLimitGuard {
	constructor(
		redisService: RedisService,
		private readonly authService: AuthService,
		private readonly reflector: Reflector
	) {
		super(redisService);
	}

	async getKey(context: ExecutionContext): Promise<string> {
		const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());
		if (isPublic) {
			return '';
		}

		const request = context.switchToHttp().getRequest();
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

		return `token-rate-limit:${token}`;
	}

	async getLimit(context: ExecutionContext): Promise<number> {
		const request = context.switchToHttp().getRequest();
		const tokenHeader = request.headers['authorization'];
		const token = tokenHeader.replace('Bearer ', '');
		const tokenDoc = await this.authService.findToken(token);
		if (!tokenDoc) {
			this.logger.warn('Token not found in database');
			throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
		}
		return tokenDoc.maxRequests;
	}

	async getWindow(context: ExecutionContext): Promise<number> {
		const request = context.switchToHttp().getRequest();
		const tokenHeader = request.headers['authorization'];
		const token = tokenHeader.replace('Bearer ', '');
		const tokenDoc = await this.authService.findToken(token);
		if (!tokenDoc) {
			this.logger.warn('Token not found in database');
			throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
		}
		const timeRemaining = Math.ceil((tokenDoc.renewAt.getTime() - Date.now()) / 1000);
		if (timeRemaining <= 0) {
			this.logger.warn('Token has expired');
			throw new HttpException('Token has expired', HttpStatus.FORBIDDEN);
		}
		return timeRemaining;
	}
}
