// src/features/notifications/notifications.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MailsModule } from 'src/modules/mails/mails.module'; // Import MailsModule
import {
	User,
	UserSchema
} from '../../modules/mongoose/schemas/user.schema';
import { UsersController } from '../users/users.controller';
import { MyUsersService } from '../users/users.service';
import { MyNotificationsService } from './notifications.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		MailsModule // Add MailsModule to imports
	],
	providers: [MyNotificationsService, MyUsersService],
	controllers: [UsersController],
	exports: [MyUsersService, MyNotificationsService]
})
export class MyNotificationsModule {}
