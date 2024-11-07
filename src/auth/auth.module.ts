// .//src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MyRedisModule } from './redis/redis.module';
import { Token, TokenSchema } from './token.schema';

@Module({
	imports: [MyRedisModule, MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }])],
	providers: [AuthService],
	controllers: [AuthController],
	exports: [AuthService] // Export AuthService for use in guards
})
export class MyAuthModule {}
