// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MyMongooseModule } from './mongoose/mongoose.module';
import { MyRedisModule } from './redis/redis.module';
import { User, UserSchema } from './schema/user.schema';

@Module({
	imports: [MyRedisModule, MyMongooseModule, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
	providers: [AuthService],
	controllers: [AuthController],
	exports: [AuthService]
})
export class MyAuthModule {}
