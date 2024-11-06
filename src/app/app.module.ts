// src/app/app.module.ts

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from 'src/auth/auth.module';
import { RateLimitingGuard } from 'src/auth/guards/rate-limit.guard';
import { MyMongoModule } from 'src/auth/mongo/mongo.module';
import { MyRedisModule } from 'src/auth/redis/redis.module';
import { MyConfigModule } from 'src/config/config.module';
import { AllExceptionsFilter } from 'src/filters/all-exceptions.filter';
import { ResponseFormatInterceptor } from 'src/interceptors/response-format.interceptor';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MyConfigModule, MyRedisModule, MyMongoModule, AuthModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RateLimitingGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseFormatInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
