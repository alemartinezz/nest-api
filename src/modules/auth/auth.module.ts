// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { MyNotificationsModule } from '../../features/notifications/notifications.module';
import { User, UserSchema } from '../mongoose/schemas/user.schema';
import { RedisModule } from '../redis/redis.module';
import { SharedModule } from '../shared.module';
import { IpRateLimitGuard } from './guards/ip-rate-limit.guard';
import { RolesGuard } from './guards/roles.guard';
import { TokenRateLimitGuard } from './guards/token-rate-limit.guard';
import { RateLimitConfigService } from './services/rate-limit-config.service';
import { SuperUserService } from './services/super-user.service';

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema
			}
		]),
		MyNotificationsModule,
		SharedModule,
		RedisModule
	],
	providers: [
		RateLimitConfigService,
		SuperUserService,
		{
			provide: APP_GUARD,
			useClass: IpRateLimitGuard
		},
		{
			provide: APP_GUARD,
			useClass: TokenRateLimitGuard
		},
		{
			provide: APP_GUARD,
			useClass: RolesGuard
		}
	],
	exports: [RateLimitConfigService]
})
export class AuthModule {}
