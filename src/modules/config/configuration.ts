// src/modules/config/configuration.ts

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
	@IsString({ message: 'NODE_ENV must be a string.' })
	@IsNotEmpty({ message: 'NODE_ENV is required.' })
	@IsIn(['development', 'staging', 'production', 'test'], {
		message:
			'NODE_ENV must be one of the following: development, staging, production, test.'
	})
	NODE_ENV: string;

	@IsString({ message: 'API_HOST must be a string.' })
	@IsNotEmpty({ message: 'API_HOST is required.' })
	API_HOST: string;

	@IsNumber({}, { message: 'API_PORT must be a number.' })
	@IsNotEmpty({ message: 'API_PORT is required.' })
	API_PORT: number;

	@IsString({ message: 'PROTOCOL must be a string.' })
	@IsNotEmpty({ message: 'PROTOCOL is required.' })
	PROTOCOL: string;

	// ---------------------- //
	// -- Encryption Config -- //
	// ---------------------- //
	@IsString({ message: 'ENCRYPTION_KEY must be a string.' })
	@IsNotEmpty({ message: 'ENCRYPTION_KEY is required.' })
	ENCRYPTION_KEY: string;

	@IsString({ message: 'IV_HEX must be a string.' })
	@IsNotEmpty({ message: 'IV_HEX is required.' })
	IV_HEX: string;

	@IsString({ message: 'TOKEN_REGEX must be a string.' })
	@IsNotEmpty({ message: 'TOKEN_REGEX is required.' })
	TOKEN_REGEX: string;

	// ---------------------- //
	// ----- Throttling ----- //
	// ---------------------- //
	@IsNumber({}, { message: 'IP_RATE_LIMIT_MAX must be a number.' })
	@IsNotEmpty({ message: 'IP_RATE_LIMIT_MAX is required.' })
	IP_RATE_LIMIT_MAX: number;

	@IsNumber({}, { message: 'IP_RATE_LIMIT_WINDOW must be a number.' })
	@IsNotEmpty({ message: 'IP_RATE_LIMIT_WINDOW is required.' })
	IP_RATE_LIMIT_WINDOW: number;

	// ---------------------- //
	// ------- Redis -------- //
	// ---------------------- //
	@IsString({ message: 'REDIS_HOST must be a string.' })
	@IsNotEmpty({ message: 'REDIS_HOST is required.' })
	REDIS_HOST: string;

	@IsNumber({}, { message: 'REDIS_PORT must be a number.' })
	@IsNotEmpty({ message: 'REDIS_PORT is required.' })
	REDIS_PORT: number;

	@IsOptional()
	@IsString({ message: 'REDIS_PASSWORD must be a string.' })
	REDIS_PASSWORD?: string;
	// ---------------------- //
	// ----- Mongo Config ---- //
	// ---------------------- //
	@IsString({ message: 'MONGO_USERNAME must be a string.' })
	@IsNotEmpty({ message: 'MONGO_USERNAME is required.' })
	MONGO_USERNAME: string;

	@IsString({ message: 'MONGO_PASSWORD must be a string.' })
	@IsNotEmpty({ message: 'MONGO_PASSWORD is required.' })
	MONGO_PASSWORD: string;

	@IsString({ message: 'MONGO_HOST must be a string.' })
	@IsNotEmpty({ message: 'MONGO_HOST is required.' })
	MONGO_HOST: string;

	@IsNumber({}, { message: 'MONGO_PORT must be a number.' })
	@IsNotEmpty({ message: 'MONGO_PORT is required.' })
	MONGO_PORT: number;

	@IsString({ message: 'MONGO_DATABASE must be a string.' })
	@IsNotEmpty({ message: 'MONGO_DATABASE is required.' })
	MONGO_DATABASE: string;

	@IsOptional()
	@IsString({ message: 'MONGO_URI must be a string if provided.' })
	MONGO_URI?: string;

	// ---------------------- //
	// ----- Email Config --- //
	// ---------------------- //
	@IsString({ message: 'EMAIL_HOST must be a string.' })
	@IsNotEmpty({ message: 'EMAIL_HOST is required.' })
	EMAIL_HOST: string;

	@IsNumber({}, { message: 'EMAIL_PORT must be a number.' })
	@IsNotEmpty({ message: 'EMAIL_PORT is required.' })
	EMAIL_PORT: number;

	@IsBoolean({ message: 'EMAIL_SECURE must be a boolean.' })
	@IsNotEmpty({ message: 'EMAIL_SECURE is required.' })
	EMAIL_SECURE: boolean;

	@IsString({ message: 'EMAIL_USER must be a string.' })
	@IsNotEmpty({ message: 'EMAIL_USER is required.' })
	EMAIL_USER: string;

	@IsString({ message: 'EMAIL_PASSWORD must be a string.' })
	@IsNotEmpty({ message: 'EMAIL_PASSWORD is required.' })
	EMAIL_PASSWORD: string;

	@IsString({ message: 'EMAIL_FROM must be a string.' })
	@IsNotEmpty({ message: 'EMAIL_FROM is required.' })
	EMAIL_FROM: string;

	// ---------------------- //
	// -------- Super ------- //
	// ---------------------- //
	@IsString({ message: 'SUPER_TOKEN must be a string.' })
	@IsNotEmpty({ message: 'SUPER_TOKEN is required.' })
	SUPER_TOKEN: string;

	@IsEmail({}, { message: 'SUPER_EMAIL must be a valid email address.' })
	@IsNotEmpty({ message: 'SUPER_EMAIL is required.' })
	SUPER_EMAIL: string;

	@IsString({ message: 'SUPER_PASSWORD must be a string.' })
	@IsNotEmpty({ message: 'SUPER_PASSWORD is required.' })
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
