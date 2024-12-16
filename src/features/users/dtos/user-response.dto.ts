// src/features/users/dtos/user-response.dto.ts

import {
	Exclude, Expose, Transform
} from 'class-transformer';

export class UserResponseDto {
	@Expose()
	id: string;

	@Expose()
	email: string;

	@Expose()
	emailVerified: boolean;

	@Expose()
	role: string;

	@Expose()
	token: string;

	@Exclude()
	tokenExpiration: Date;

	@Exclude()
	tokenTotalUsage: number;

	// Exclude sensitive fields
	@Exclude()
	password: string;

	// Optionally exclude or transform other fields as needed
	@Exclude()
	__v: number;

	@Transform(({
		obj
	}) => obj._id.toString())
	get userId(): string {
		return this.id;
	}
}
