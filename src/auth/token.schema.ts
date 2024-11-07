// src/auth/token.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema()
export class Token {
	@Prop({ required: true, unique: true })
	token: string;

	@Prop({ required: true })
	role: string;

	@Prop({ required: true })
	requestsRemaining: number;

	@Prop({ required: true })
	maxRequests: number;

	@Prop({ required: true })
	windowSizeInSeconds: number;

	@Prop({ required: true })
	renewAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
