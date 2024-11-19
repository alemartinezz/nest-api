// src/users/users.controller.ts

import { Body, Controller, Get, Put } from '@nestjs/common';
import { sanitizeObject } from 'src/common/utils/response.utils';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserDocument } from '../database/mongoose/schemas/user.schema';
import { UserRole } from './dtos/roles.enum';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@Get('me')
	async getProfile(
		@CurrentUser() authenticatedUser: UserDocument
	): Promise<{ user: Partial<UserDocument> }> {
		const user = await this.usersService.getUserById(
			authenticatedUser.id
		);

		const sanitizedUser = sanitizeObject(
			user.toObject() as Record<string, any>
		);

		return { user: sanitizedUser };
	}

	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@Put('me')
	async updateProfile(
		@CurrentUser() authenticatedUser: UserDocument,
		@Body() updates: UpdateUserDto
	): Promise<{ message: string; user?: Partial<UserDocument> }> {
		const { user, updated } = await this.usersService.updateUser(
			authenticatedUser,
			updates
		);

		const sanitizedUser = sanitizeObject(
			user.toObject() as Record<string, any>
		);

		const message = updated
			? 'User updated successfully.'
			: 'No changes detected.';

		return { message, user: sanitizedUser };
	}
}
