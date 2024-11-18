// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailModule } from 'src/notifications/mail/mail.module';
import { MyMongooseModule } from '../database/mongoose/mongoose.module';
import { MyRedisModule } from '../database/redis/redis.module';
import { User, UserSchema } from '../database/schemas/user.schema';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RateLimitConfigService } from './guards/rate-limit-config.service';

@Module({
	imports: [
		MyRedisModule,
		MyMongooseModule,
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		MailModule
	],
	providers: [AuthService, RateLimitConfigService],
	controllers: [AuthController],
	exports: [AuthService, RateLimitConfigService]
})
export class MyAuthModule {}
