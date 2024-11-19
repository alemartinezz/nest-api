// src/app/app.module.ts

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MyAuthModule } from 'src/auth/auth.module';
import { IpRateLimitGuard } from '../auth/guards/ip-rate-limit.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TokenRateLimitGuard } from '../auth/guards/token-rate-limit.guard';
import { MyConfigModule } from '../config/config.module';
import { MyMongooseModule } from '../database/mongoose/mongoose.module';
import { MyRedisModule } from '../database/redis/redis.module';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		MyConfigModule,
		MyRedisModule,
		MyMongooseModule,
		MyAuthModule,
		UsersModule
	],
	controllers: [AppController],
	providers: [
		AppService,
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
	]
})
export class AppModule {}
