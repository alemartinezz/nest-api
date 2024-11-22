// src/features/users/users.controller.ts

import { Body, Controller, Get, Put } from '@nestjs/common';
import { UserDocument } from 'src/modules/mongoose/schemas/user.schema';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { UserRole } from '../../modules/auth/dtos/roles.enum';
import { UpdateUserDto } from './dtos/update-user.dto';
import { MyUsersService } from './users.service';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: MyUsersService) {}

	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@Get('me')
	async getProfile(
		@CurrentUser() authenticatedUser: UserDocument
	): Promise<{ user: Partial<UserDocument> }> {
		const user = await this.usersService.getUserById(
			authenticatedUser.id
		);
		return { user };
	}

	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@Put('me')
	async updateProfile(
		@CurrentUser() authenticatedUser: UserDocument,
		@Body() updates: UpdateUserDto
	): Promise<{ user?: Partial<UserDocument> }> {
		const { user } = await this.usersService.updateUser(
			authenticatedUser,
			updates
		);
		return { user };
	}
}
