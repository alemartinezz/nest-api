// src/modules/config/config.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateEnv } from './configuration';

@Module({
	imports: [
		NestConfigModule.forRoot({
			isGlobal: true,
			validate: validateEnv
		})
	],
	exports: [
		NestConfigModule
	] // Export ConfigModule
})

export class ConfigModule {}
