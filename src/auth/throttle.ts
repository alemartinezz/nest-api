import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { RedisService } from 'src/auth/redis/redis.service';

@Injectable()
export class RateLimitingGuard implements CanActivate {
  private readonly MAX_REQUESTS = 100; // Maximum requests
  private readonly WINDOW_SIZE = 60; // Time window in seconds

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;

    const key = `rate_limit:${ip}`;
    const current = await this.redisService.getValue(key);

    if (current && parseInt(current) >= this.MAX_REQUESTS) {
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      await this.redisService.redis
        .multi()
        .incr(key)
        .expire(key, this.WINDOW_SIZE)
        .exec();
      return true;
    }
  }
}
