// src/auth/mongo/mongo.module.ts

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from './token.schema';
import { TokenService } from './token.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  providers: [TokenService],
  exports: [MongooseModule, TokenService],
})
export class MyMongoModule {}
