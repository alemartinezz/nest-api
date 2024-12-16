// src/features/users/dtos/get-user.dto.ts

import {
	IsEmail, IsMongoId, IsOptional, IsString
} from 'class-validator';

export class GetUserDto {
	@IsOptional()
	@IsMongoId({
		message: 'Invalid id'
	})
	id?: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	token?: string;
}
