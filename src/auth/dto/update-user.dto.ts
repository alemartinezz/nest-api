// src/auth/dto/update-user.dto.ts

import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../roles.enum';

export class UpdateUserDto {
	@IsEmail()
	@IsOptional()
	email?: string;

	@IsEnum(UserRole)
	@IsOptional()
	role?: UserRole;

	@IsOptional()
	@IsString()
	token?: string;
}
