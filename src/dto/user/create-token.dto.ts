// src/dto/user/create-token.dto.ts

import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from 'src/dto/user/roles.enum';

export class CreateTokenDto {
	@IsNotEmpty()
	@IsEmail()
	email: string;

	@IsNotEmpty()
	@IsEnum(UserRole)
	role: UserRole;
}
