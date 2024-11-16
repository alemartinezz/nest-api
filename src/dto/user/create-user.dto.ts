// src/dto/user/create-user.dto.ts

import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { UserRole } from './roles.enum';

export class CreateUserDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;
}
