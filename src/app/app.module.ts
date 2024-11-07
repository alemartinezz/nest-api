// .//src/app/app.module.ts

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { IpRateLimitGuard } from 'src/auth/guards/ip-rate-limit.guard';
import { TokenRateLimitGuard } from 'src/auth/guards/token-rate-limit.guard';
import { MyRedisModule } from 'src/auth/redis/redis.module';
import { MyConfigModule } from 'src/config/config.module';
import { MyAuthModule } from '../auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		MyConfigModule,
		MyRedisModule,
		MyAuthModule,
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('MONGO_URI')
			})
		})
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
		}
	]
})
export class AppModule {}
