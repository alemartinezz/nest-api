// src/dto/user/get-user.dto.ts

import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GetUserDto {
	@IsOptional()
	@IsString()
	id?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	token?: string;
}
