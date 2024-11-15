// src/auth/mongoose/mongoose.module.ts

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
	imports: [
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				uri: configService.get<string>('MONGO_URI')
			})
		})
	],
	exports: [MongooseModule] // Exportamos MongooseModule para que otros módulos puedan usarlo
})
export class MyMongooseModule {}
