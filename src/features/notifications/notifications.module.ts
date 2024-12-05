// src/features/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailsModule } from '../../modules/mails/mails.module'; // Import MailsModule
import { SharedModule } from '../../modules/shared.module';
import { User, UserSchema } from '../../modules/mongoose/schemas/user.schema';
import { MyNotificationsService } from './notifications.service';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: User.name,
				schema: UserSchema
			}
		]),
		MailsModule,
		SharedModule
	],
	providers: [MyNotificationsService],
	controllers: [],
	exports: [MyNotificationsService]
})
export class MyNotificationsModule {}
