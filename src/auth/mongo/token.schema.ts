// src/auth/mongo/token.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema()
export class Token {
  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: true })
  startingDate: Date;

  @Prop({ required: true })
  profileGroup: string; // e.g., 'basic', 'premium', 'admin'

  @Prop({ required: true })
  rateLimit: number; // number of requests per window
}

export const TokenSchema = SchemaFactory.createForClass(Token);
