// src/database/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from 'src/users/dtos/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
	@Prop({ required: true, unique: true })
	email: string;

	@Prop({ required: true, default: false })
	emailVerified: boolean;

	@Prop()
	emailVerificationCode?: string;

	@Prop()
	emailVerificationCodeExpires?: Date;

	@Prop({ required: true })
	password: string;

	@Prop({ enum: UserRole, default: UserRole.BASIC, nullable: false })
	role: UserRole;

	@Prop({ unique: true, nullable: true })
	token?: string;

	@Prop({ type: Date })
	tokenExpiration: Date;

	@Prop({ type: Number, default: 0 })
	tokenTotalUsage: number;

	@Prop({ type: Number, default: 0 })
	tokenCurrentUsage: number;

	@Prop({ type: Number })
	tokenCurrentLimit: number;

	@Prop({ type: Number })
	tokenCurrentLeft: number;

	@Prop({ required: false })
	createdAt: Date;

	@Prop({ required: false })
	updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
