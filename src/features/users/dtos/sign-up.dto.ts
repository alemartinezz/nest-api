// /src/features/users/dtos/sign-up.dto.ts

import {
	IsEmail,
	IsNotEmpty,
	IsString,
	Matches,
	MaxLength,
	MinLength
} from 'class-validator';
export class SignUpDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(30)
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message:
			'Password too weak: must contain at least 1 uppercase letter, 1 lowercase letter, 1 number or special character, and be at least 8 characters long.'
	})
	password: string;
}
