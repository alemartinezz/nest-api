// src/auth/dto/update-user.dto.ts

import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../roles.enum';

export class UpdateUserDto {
	@IsEmail()
	@IsOptional()
	email?: string;

	@IsEnum(UserRole)
	@IsOptional()
	role?: UserRole;
}
