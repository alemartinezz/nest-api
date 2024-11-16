// src/database/redis/redis.module.ts

import { RedisModule as NestRedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
	imports: [
		NestRedisModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService): Promise<RedisModuleOptions> => ({
				type: 'single',
				options: {
					host: configService.get<string>('REDIS_HOST'),
					port: configService.get<number>('REDIS_PORT'),
					password: configService.get<string>('REDIS_PASSWORD')
				}
			})
		})
	],
	providers: [RedisService],
	exports: [RedisService]
})
export class MyRedisModule {}
