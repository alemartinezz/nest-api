// src/modules/auth/dtos/sign-in.dto.ts

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
export class SignInDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}
