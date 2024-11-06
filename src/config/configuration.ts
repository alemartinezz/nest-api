import { Logger } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsString,
  validateSync,
} from 'class-validator';

export class EnvConfig {
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
  REDIS_HOST: string;

  @IsNumberString()
  @IsNotEmpty()
  REDIS_PORT: string;

  @IsString()
  @IsNotEmpty()
  REDIS_PASSWORD: string;

  MONGO_URI: string;
}

export function validateEnv(configEnv: Record<string, unknown>): EnvConfig {
  const validatedConfig = plainToClass(EnvConfig, configEnv, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  // construct mongo uri like mongodb://username:password@host:port/database
  validatedConfig.MONGO_URI = `mongodb://${configEnv.MONGO_USERNAME}:${configEnv.MONGO_PASSWORD}@${configEnv.MONGO_HOST}:${configEnv.MONGO_PORT}/${configEnv.MONGO_DATABASE}`;

  const logger = new Logger(EnvConfig.name);

  if (errors.length > 0) {
    logger.error('❌ Failed to validate environment variables');
    throw new Error(errors.toString());
  } else {
    logger.log('✅ Successfully loaded environment variables');
  }

  return validatedConfig;
}
