// src/auth/dto/get-user-by-email.dto.ts

import { IsEmail, IsNotEmpty } from 'class-validator';

export class GetUserByEmailDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;
}
