// src/guards/rate-limiting.guard.ts

import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { TokenService } from 'src/auth/mongo/token.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimitingGuard implements CanActivate {
  constructor(
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const token = request.headers['authorization']?.split(' ')[1];

    // IP-based rate limiting
    const ipKey = `rate_limit:ip:${ip}`;
    const ipMaxRequests = 100;
    const windowSize = 60;

    const ipCurrent = await this.redisService.getValue(ipKey);
    if (ipCurrent && parseInt(ipCurrent) >= ipMaxRequests) {
      throw new HttpException(
        'Too Many Requests from IP',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      await this.redisService.redis
        .multi()
        .incr(ipKey)
        .expire(ipKey, windowSize)
        .exec();
    }

    // Token-based rate limiting
    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const tokenDoc = await this.tokenService.validateToken(token);
    if (!tokenDoc) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const userKey = `rate_limit:user:${tokenDoc.userId}`;
    const userMaxRequests = tokenDoc.rateLimit;
    const userCurrent = await this.redisService.getValue(userKey);
    if (userCurrent && parseInt(userCurrent) >= userMaxRequests) {
      throw new HttpException(
        'Too Many Requests for user',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      await this.redisService.redis
        .multi()
        .incr(userKey)
        .expire(userKey, windowSize)
        .exec();
    }

    return true;
  }
}
