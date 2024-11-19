// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../database/mongoose/schemas/user.schema';
import { MailModule } from '../notifications/mail/mail.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { IpRateLimitGuard } from './guards/ip-rate-limit.guard';
import { RolesGuard } from './guards/roles.guard';
import { TokenRateLimitGuard } from './guards/token-rate-limit.guard';
import { RateLimitConfigService } from './services/rate-limit-config.service';
import { SuperUserService } from './services/super-user.service';

// src/auth/auth.module.ts

import { MyRedisModule } from '../database/redis/redis.module'; // Import MyRedisModule

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		MailModule,
		UsersModule,
		MyRedisModule // Add MyRedisModule to imports
	],
	providers: [
		AuthService,
		RateLimitConfigService,
		SuperUserService,
		RolesGuard,
		IpRateLimitGuard,
		TokenRateLimitGuard
	],
	controllers: [AuthController],
	exports: [AuthService, RateLimitConfigService]
})
export class MyAuthModule {}
