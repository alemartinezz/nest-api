// src/auth/schema/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../roles.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true, unique: true, minlength: 32, maxlength: 32 })
	token: string;

	@Prop({ required: true, enum: UserRole, default: UserRole.USER })
	role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
