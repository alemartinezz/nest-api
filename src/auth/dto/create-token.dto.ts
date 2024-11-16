// src/auth/dto/create-token.dto.ts

import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../roles.enum';

export class CreateTokenDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsEnum(UserRole)
	role: UserRole;
}
