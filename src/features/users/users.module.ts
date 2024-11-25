// src/features/users/users.module.ts

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/modules/auth/auth.module';
import { SharedModule } from 'src/modules/shared.module';
import {
	User,
	UserSchema
} from '../../modules/mongoose/schemas/user.schema';
import { MyNotificationsModule } from '../notifications/notifications.module';
import { MyUsersController } from './users.controller';
import { MyUsersService } from './users.service';
@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
		MyNotificationsModule,
		forwardRef(() => AuthModule),
		SharedModule
	],
	providers: [MyUsersService],
	controllers: [MyUsersController],
	exports: [MyUsersService]
})
export class MyUsersModule {}
