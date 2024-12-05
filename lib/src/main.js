var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './modules/api/http-exception.filter';
import { TransformInterceptor } from './modules/api/transform.interceptor';
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield NestFactory.create(AppModule, {
            logger: ['log', 'error', 'warn', 'debug', 'verbose']
        });
        app.getHttpAdapter().getInstance().disable('x-powered-by');
        app.useGlobalInterceptors(new TransformInterceptor());
        app.useGlobalFilters(new AllExceptionsFilter());
        app.useGlobalPipes(new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true
            }
        }));
        const configService = app.get(ConfigService);
        const protocol = configService.get('PROTOCOL');
        const apiPort = configService.get('API_PORT');
        const apiHost = configService.get('API_HOST');
        yield app.listen(apiPort, apiHost, () => {
            console.log(`🚀 Server running at ${protocol}://${apiHost}:${apiPort}`);
        });
    });
}
bootstrap();
//# sourceMappingURL=main.js.map