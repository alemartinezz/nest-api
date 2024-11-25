// src/main.ts

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './modules/api/http-exception.filter';
import { TransformInterceptor } from './modules/api/transform.interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ['log', 'error', 'warn', 'debug', 'verbose']
	});

	// Disable 'X-Powered-By' header
	app.getHttpAdapter().getInstance().disable('x-powered-by');

	// Enable global interceptors and filters
	app.useGlobalInterceptors(new TransformInterceptor());
	app.useGlobalFilters(new AllExceptionsFilter());

	// Enable global ValidationPipe with transformation
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Strip properties that don't have decorators
			forbidNonWhitelisted: true, // Throw errors on non-whitelisted properties
			transform: true, // Automatically transform payloads to DTO instances
			transformOptions: {
				enableImplicitConversion: true // Allow implicit type conversion
			}
		})
	);

	const configService = app.get(ConfigService);
	const protocol = configService.get<string>('PROTOCOL');
	const apiPort = configService.get<number>('API_PORT');
	const apiHost = configService.get<string>('API_HOST');

	await app.listen(apiPort, apiHost, () => {
		console.log(
			`🚀 Server running at ${protocol}://${apiHost}:${apiPort}`
		);
	});
}
bootstrap();
