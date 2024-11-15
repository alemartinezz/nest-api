// src/app/app.module.ts

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { IpRateLimitGuard } from 'src/auth/guards/ip-rate-limit.guard';
import { TokenRateLimitGuard } from 'src/auth/guards/token-rate-limit.guard';
import { MyMongooseModule } from 'src/auth/mongoose/mongoose.module';
import { MyRedisModule } from 'src/auth/redis/redis.module';
import { MyConfigModule } from 'src/config/config.module';
import { MyAuthModule } from '../auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [MyConfigModule, MyRedisModule, MyMongooseModule, MyAuthModule],
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
		}
	]
})
export class AppModule {}
