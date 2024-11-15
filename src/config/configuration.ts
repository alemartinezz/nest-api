// src/config/configuration.ts

import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

export class EnvConfig {
	@IsString()
	@IsNotEmpty()
	@IsIn(['development', 'staging', 'production'])
	NODE_ENV: string;

	@IsString()
	@IsNotEmpty()
	API_HOST: string;

	@IsNumber()
	@IsNotEmpty()
	API_PORT: number;

	@IsString()
	@IsNotEmpty()
	PROTOCOL: string;

	@IsNumber()
	@IsNotEmpty()
	IP_RATE_LIMIT_MAX: number;

	@IsNumber()
	@IsNotEmpty()
	IP_RATE_LIMIT_WINDOW: number;

	@IsString()
	@IsNotEmpty()
	REDIS_HOST: string;

	@IsNumber()
	@IsNotEmpty()
	REDIS_PORT: number;

	@IsString()
	@IsNotEmpty()
	REDIS_PASSWORD: string;

	@IsString()
	@IsNotEmpty()
	MONGO_USERNAME: string;

	@IsString()
	@IsNotEmpty()
	MONGO_PASSWORD: string;

	@IsString()
	@IsNotEmpty()
	MONGO_HOST: string;

	@IsNumber()
	@IsNotEmpty()
	MONGO_PORT: number;

	@IsString()
	@IsNotEmpty()
	MONGO_DATABASE: string;

	@IsString()
	@IsNotEmpty()
	ENCRYPTION_KEY: string;

	@IsString()
	@IsNotEmpty()
	IV_HEX: string;

	@IsOptional()
	@IsString()
	MONGO_URI?: string;
}

export function validateEnv(configEnv: Record<string, unknown>): EnvConfig {
	const validatedConfig = plainToClass(EnvConfig, configEnv, {
		enableImplicitConversion: true
	});

	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false
	});

	if (errors.length > 0) {
		const errorMessages = errors.map((error) => Object.values(error.constraints || {}).join(', ')).join('; ');
		const logger = new Logger(EnvConfig.name);
		logger.error(`❌ Failed to validate environment variables: ${errorMessages}`);
		throw new Error(`Environment validation failed: ${errorMessages}`);
	}

	// URL-encode the username y password
	const encodedUsername = encodeURIComponent(validatedConfig.MONGO_USERNAME);
	const encodedPassword = encodeURIComponent(validatedConfig.MONGO_PASSWORD);

	// Construir la URI de MongoDB
	validatedConfig.MONGO_URI = `mongodb://${encodedUsername}:${encodedPassword}@${validatedConfig.MONGO_HOST}:${validatedConfig.MONGO_PORT}/${validatedConfig.MONGO_DATABASE}?authSource=admin`;
	console.log(`MongoDB URI: ${validatedConfig.MONGO_URI}`);

	const logger = new Logger(EnvConfig.name);
	logger.log('✅ Successfully loaded and validated environment variables');

	return validatedConfig;
}
