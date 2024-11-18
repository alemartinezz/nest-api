// src/database/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../../dto/user/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true, default: false })
	emailVerified: boolean;

	@Prop({ required: true })
	password: string;

	@Prop({ enum: UserRole, default: UserRole.USER, nullable: true })
	role: UserRole;

	@Prop({ unique: true, nullable: true })
	token?: string;

	@Prop({ required: false })
	createdAt: Date;

	@Prop({ required: false })
	updatedAt: Date;
}

declare module 'express-serve-static-core' {
	interface Request {
		user?: UserDocument;
	}
}

export const UserSchema = SchemaFactory.createForClass(User);
