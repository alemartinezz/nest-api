// src/app/app.module.ts

import { Module } from '@nestjs/common';
import { MyMongoModule } from 'src/auth/mongo/mongo.module';
import { MyRedisModule } from 'src/auth/redis/redis.module';
import { MyConfigModule } from 'src/config/config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [MyConfigModule, MyRedisModule, MyMongoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
