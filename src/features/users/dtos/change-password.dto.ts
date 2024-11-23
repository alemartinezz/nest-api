// /src/features/users/dtos/change-password.dto.ts

import {
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength
} from 'class-validator';
export class ChangePasswordDto {
	@IsString()
	@IsNotEmpty()
	currentPassword: string;
	@IsString()
	@IsNotEmpty()
	@MinLength(8, {
		message: 'New password must be at least 8 characters long.'
	})
	@MaxLength(30, {
		message: 'New password must not exceed 30 characters.'
	})
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message:
			'New password too weak: must contain at least 1 uppercase letter, 1 lowercase letter, 1 number or special character, and be at least 8 characters long.'
	})
	newPassword: string;
}
