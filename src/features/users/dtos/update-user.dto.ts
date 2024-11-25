// src/features/users/dtos/update-user.dto.ts

import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from 'src/modules/auth/dtos/roles.guards.dto';

export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;

	@IsOptional()
	@IsString()
	token?: string;
}
