// src/auth/dto/get-user-by-id.dto.ts

import { IsNotEmpty } from 'class-validator';

export class GetUserByIdDto {
	@IsNotEmpty()
	id: string;
}
