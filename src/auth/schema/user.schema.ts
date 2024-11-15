// src/auth/schema/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
	@Prop({ required: true, unique: true })
	clientId: string;

	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true, unique: true })
	token: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
