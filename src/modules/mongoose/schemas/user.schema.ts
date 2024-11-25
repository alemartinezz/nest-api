// src/modules/mongoose/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from 'src/modules/auth/dtos/roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
	@Prop({ required: true, unique: true, nullable: false })
	email: string;
	@Prop({ required: true, default: false, nullable: false })
	emailVerified: boolean;
	@Prop({ nullable: true })
	emailVerificationCode?: string;
	@Prop({ nullable: true })
	emailVerificationCodeExpires?: Date;
	@Prop({ required: true, nullable: false })
	password: string;
	@Prop({ enum: UserRole, default: UserRole.BASIC, nullable: false })
	role: UserRole;
	@Prop({ unique: true, nullable: true })
	token?: string;
	@Prop({ type: Date, nullable: true })
	tokenExpiration: Date;
	@Prop({ type: Number, default: 0 })
	tokenTotalUsage: number;
	@Prop({ type: Number, nullable: true })
	tokenCurrentUsage: number;
	@Prop({ type: Number, nullable: true })
	tokenCurrentLimit: number;
	@Prop({ type: Number, nullable: true })
	tokenCurrentLeft: number;
	@Prop({ required: false })
	createdAt: Date;
	@Prop({ required: false })
	updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
