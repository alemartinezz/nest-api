// src/features/users/dtos/verify-email.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class VerifyEmailDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;
	@IsString()
	@IsNotEmpty()
	code: string;
}
