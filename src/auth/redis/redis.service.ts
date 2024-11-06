// src/redis/redis.service.ts

import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);

  constructor(@InjectRedis() readonly redis: Redis) {}

  async onModuleInit() {
    try {
      await this.redis.ping();
      this.logger.log('✅ Successfully connected to Redis');
    } catch (e) {
      this.logger.error('❌ Failed to connect to Redis', e.message);
      throw new Error(e);
    }
  }

  async setValue(key: string, value: string) {
    await this.redis.set(key, value);
  }

  async getValue(key: string): Promise<string | null> {
    return this.redis.get(key);
  }
}
