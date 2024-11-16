// src/auth/dto/get-user-by-email.dto.ts

import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GetUserDto {
	@IsOptional()
	@IsString()
	id?: string;

	@IsOptional()
	@IsEmail()
	email?: string;
}
