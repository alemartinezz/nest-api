// src/app/app.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { MyNotificationsModule } from 'src/features/notifications/notifications.module';
import { MyUsersModule } from 'src/features/users/users.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ConfigModule } from 'src/modules/config/config.module';
import { MongooseModulex } from 'src/modules/mongoose/mongoose.module';
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
