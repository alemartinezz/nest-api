// src/features/users/users.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
	User,
	UserSchema
} from '../../modules/mongoose/schemas/user.schema';
import { UsersController } from './users.controller';
import { MyUsersService } from './users.service';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
	],
	providers: [MyUsersService],
	controllers: [UsersController],
	exports: [MyUsersService]
})
export class MyUsersModule {}
