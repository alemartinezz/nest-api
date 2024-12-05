// src/app/app.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MyNotificationsModule } from '../features/notifications/notifications.module';
import { MyUsersModule } from '../features/users/users.module';
import { AuthModule } from '../modules/auth/auth.module';
import { ConfigModule } from '../modules/config/config.module';
import { MongooseModulex } from '../modules/mongoose/mongoose.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
	imports: [
		ConfigModule,
		MongooseModulex,
		forwardRef(() => AuthModule),
		MyUsersModule,
		MyNotificationsModule
	],
	controllers: [AppController],
	providers: [AppService]
})
export class AppModule {}
