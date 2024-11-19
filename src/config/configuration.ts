// src/config/configuration.ts

import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
	IsBoolean,
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	validateSync
} from 'class-validator';

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

	// ---------------------- //
	// - Encryption Config -- //
	// ---------------------- //

	@IsString()
	@IsNotEmpty()
	ENCRYPTION_KEY: string;

	@IsString()
	@IsNotEmpty()
	IV_HEX: string;

	@IsString()
	@IsNotEmpty()
	TOKEN_REGEX: string;

	// ---------------------- //
	// ----- Throttling ----- //
	// ---------------------- //

	@IsNumber()
	@IsNotEmpty()
	IP_RATE_LIMIT_MAX: number;

	@IsNumber()
	@IsNotEmpty()
	IP_RATE_LIMIT_WINDOW: number;

	// ---------------------- //
	// ------- Redis -------- //
	// ---------------------- //

	@IsString()
	@IsNotEmpty()
	REDIS_HOST: string;

	@IsNumber()
	@IsNotEmpty()
	REDIS_PORT: number;

	@IsString()
	@IsNotEmpty()
	REDIS_PASSWORD: string;

	// ---------------------- //
	// ----- Mongo Config --- //
	// ---------------------- //

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

	@IsOptional()
	@IsString()
	MONGO_URI?: string;

	// ---------------------- //
	// ----- Email Config --- //
	// ---------------------- //

	@IsString()
	@IsNotEmpty()
	EMAIL_HOST: string;

	@IsNumber()
	@IsNotEmpty()
	EMAIL_PORT: number;

	@IsBoolean()
	@IsNotEmpty()
	EMAIL_SECURE: boolean;

	@IsString()
	@IsNotEmpty()
	EMAIL_USER: string;

	@IsString()
	@IsNotEmpty()
	EMAIL_PASSWORD: string;

	@IsString()
	@IsNotEmpty()
	EMAIL_FROM: string;

	// ---------------------- //
	// -------- Super ------- //
	// ---------------------- //

	@IsString()
	@IsNotEmpty()
	SUPER_TOKEN: string;

	@IsEmail()
	@IsNotEmpty()
	SUPER_EMAIL: string;

	@IsString()
	@IsNotEmpty()
	SUPER_PASSWORD: string;
}

export function validateEnv(configEnv: Record<string, unknown>): EnvConfig {
	const validatedConfig = plainToClass(EnvConfig, configEnv, {
		enableImplicitConversion: true
	});

	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false
	});

	if (errors.length > 0) {
		const errorMessages = errors
			.map((error) =>
				Object.values(error.constraints || {}).join(', ')
			)
			.join('; ');
		const logger = new Logger(EnvConfig.name);
		logger.error(
			`❌ Failed to validate environment variables: ${errorMessages}`
		);
		throw new Error(`Environment validation failed: ${errorMessages}`);
	}

	// URL-encode the username and password
	const encodedUsername = encodeURIComponent(
		validatedConfig.MONGO_USERNAME
	);
	const encodedPassword = encodeURIComponent(
		validatedConfig.MONGO_PASSWORD
	);

	// Construct the MongoDB URI
	validatedConfig.MONGO_URI = `mongodb://${encodedUsername}:${encodedPassword}@${validatedConfig.MONGO_HOST}:${validatedConfig.MONGO_PORT}/${validatedConfig.MONGO_DATABASE}?authSource=admin`;
	console.log(`MongoDB URI: ${validatedConfig.MONGO_URI}`);

	const logger = new Logger(EnvConfig.name);
	logger.log('✅ Successfully loaded and validated environment variables');

	return validatedConfig;
}
