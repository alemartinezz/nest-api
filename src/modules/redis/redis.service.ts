// src/modules/redis/redis.service.ts

import {
	Injectable, Logger
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
	createClient, RedisClientType
} from 'redis';

@Injectable()
export class RedisService {
	private readonly logger = new Logger(RedisService.name);
	private client: RedisClientType;

	constructor(private readonly configService: ConfigService) {
		const url = this.getRedisUrl();

		this.client = createClient({
			url
		});

		this.client.on(
			'error',
			(err) => {
				this.logger.error(
					'Redis Client Error',
					err
				);
			}
		);

		this.client.connect()
			.catch((err) => {
				this.logger.error(
					'Redis Client Connection Error',
					err
				);
			});
	}

	private getRedisUrl(): string {
		const host = this.configService.get<string>('REDIS_HOST');
		const port = this.configService.get<number>('REDIS_PORT');
		const password = this.configService.get<string>('REDIS_PASSWORD');

		if (password) {
			return `redis://:${encodeURIComponent(password)}@${host}:${port}`;
		} else {
			return `redis://${host}:${port}`;
		}
	}

	getClient(): RedisClientType {
		return this.client;
	}
}
