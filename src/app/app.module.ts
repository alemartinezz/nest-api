// src/app/app.module.ts

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MyNotificationsModule } from 'src/features/notifications/notifications.module'; // Import NotificationsModule
import { MyUsersModule } from 'src/features/users/users.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { TokenRateLimitGuard } from 'src/modules/auth/guards/token-rate-limit.guard';
import { ConfigModule } from 'src/modules/config/config.module';
import { MongooseModulex } from 'src/modules/mongoose/mongoose.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ConfigModule,
		MongooseModulex,
		AuthModule,
		MyUsersModule,
		MyNotificationsModule // Add NotificationsModule to imports
	],
	controllers: [AppController],
	providers: [
		AppService,
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
