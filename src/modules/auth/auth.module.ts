// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MyNotificationsModule } from 'src/features/notifications/notifications.module';
import { MyUsersModule } from 'src/features/users/users.module';
import { User, UserSchema } from '../mongoose/schemas/user.schema';
import { RolesGuard } from './guards/roles.guard';
import { TokenRateLimitGuard } from './guards/token-rate-limit.guard';
import { RateLimitConfigService } from './services/rate-limit-config.service';
import { SuperUserService } from './services/super-user.service';

@Module({
	imports: [
		ConfigModule,
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		MyUsersModule,
		MyNotificationsModule
	],
	providers: [
		RateLimitConfigService,
		SuperUserService,
		RolesGuard,
		TokenRateLimitGuard
	],
	exports: [RateLimitConfigService]
})
export class AuthModule {}