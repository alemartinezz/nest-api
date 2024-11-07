// .//src/auth/redis/redis.service.ts

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

	// Additional methods can be added here if needed
}
