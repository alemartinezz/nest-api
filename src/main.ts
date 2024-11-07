// src/main.ts

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './common/filters/http-exception-filter';
import { TransformInterceptor } from './common/interceptors/transform-interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: ['log', 'error', 'warn', 'debug', 'verbose']
	});

	app.useGlobalInterceptors(new TransformInterceptor());
	app.useGlobalFilters(new AllExceptionsFilter());

	const configService = app.get(ConfigService);
	const apiPort = configService.get<number>('API_PORT');
	const apiHost = configService.get<string>('API_HOST');

	await app.listen(apiPort, apiHost, () => {
		const protocol = configService.get<string>('PROTOCOL');
		console.log(`🚀 Server running at ${protocol}://${apiHost}:${apiPort}`);
	});
}

bootstrap();
