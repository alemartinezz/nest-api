// .//src/auth/token.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema()
export class Token {
	@Prop({ required: true, unique: true })
	token: string;

	@Prop({ required: true })
	requestsRemaining: number;

	@Prop({ required: true })
	renewAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
