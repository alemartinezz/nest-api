// src/auth/dto/create-token.dto.ts

import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../roles.enum';

export class CreateTokenDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsEnum(UserRole)
	@IsNotEmpty()
	role: UserRole;
}
