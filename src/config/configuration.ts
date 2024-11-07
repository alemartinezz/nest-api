// .//src/config/configuration.ts

import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumberString, IsString, validateSync } from 'class-validator';

export class EnvConfig {
	// Existing environment variables...
	@IsString()
	@IsNotEmpty()
	@IsIn(['development', 'staging', 'production'])
	NODE_ENV: string;

	@IsString()
	@IsNotEmpty()
	API_HOST: string;

	@IsNumberString()
	@IsNotEmpty()
	API_PORT: string;

	@IsString()
	@IsNotEmpty()
	PROTOCOL: string;

	@IsString()
	@IsNotEmpty()
	IP_RATE_LIMIT_MAX: string;

	@IsString()
	@IsNotEmpty()
	IP_RATE_LIMIT_WINDOW: string;

	@IsString()
	@IsNotEmpty()
	REDIS_HOST: string;

	@IsNumberString()
	@IsNotEmpty()
	REDIS_PORT: string;

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

	@IsNumberString()
	@IsNotEmpty()
	MONGO_PORT: string;

	@IsString()
	@IsNotEmpty()
	MONGO_DATABASE: string;

	@IsString()
	@IsNotEmpty()
	ENCRYPTION_KEY: string;

	@IsString()
	@IsNotEmpty()
	IV_HEX: string;

	MONGO_URI: string;
}

export function validateEnv(configEnv: Record<string, unknown>): EnvConfig {
	const validatedConfig = plainToClass(EnvConfig, configEnv, {
		enableImplicitConversion: true
	});

	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false
	});

	// URL-encode the username and password
	const encodedUsername = encodeURIComponent(configEnv.MONGO_USERNAME as string);
	const encodedPassword = encodeURIComponent(configEnv.MONGO_PASSWORD as string);

	// Construct MongoDB URI with encoded credentials and authSource
	validatedConfig.MONGO_URI = `mongodb://${encodedUsername}:${encodedPassword}@${configEnv.MONGO_HOST}:${configEnv.MONGO_PORT}/${configEnv.MONGO_DATABASE}?authSource=admin`;
	console.log(`MongoDB URI: ${validatedConfig.MONGO_URI}`);

	const logger = new Logger(EnvConfig.name);

	if (errors.length > 0) {
		logger.error('❌ Failed to validate environment variables');
		throw new Error(errors.toString());
	} else {
		logger.log('✅ Successfully loaded environment variables');
	}

	return validatedConfig;
}
