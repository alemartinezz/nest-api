// src/auth/auth.controller.ts

import { BadRequestException, Body, Controller, Get, NotFoundException, Post, Put, Query } from '@nestjs/common';
import { sanitizeObject } from 'src/common/utils/object.util';
import { UserDocument } from 'src/database/schemas/user.schema';
import { CreateTokenDto } from 'src/dto/user/create-token.dto';
import { CreateUserDto } from 'src/dto/user/create-user.dto';
import { GetUserDto } from 'src/dto/user/get-user.dto';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';
import { UserRole } from '../dto/user/roles.enum';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Get('user')
	async getUser(@Query() params: GetUserDto): Promise<{ user: Partial<UserDocument> }> {
		if (!params.id && !params.email) {
			throw new BadRequestException('Either id or email must be provided');
		}

		const user = await this.authService.getUser(params);

		if (!user) {
			throw new NotFoundException(`User with ${params.id ? 'id' : 'email'} ${params.id || params.email} not found.`);
		}

		// Sanitize the user object
		const sanitizedUser = sanitizeObject(user.toObject());

		return { user: sanitizedUser };
	}

	@Public()
	@Post('user')
	async createUser(@Body() createUserDto: CreateUserDto): Promise<{ user: Partial<UserDocument> }> {
		const { email, role } = createUserDto;

		const user = await this.authService.createUser(email, role ?? UserRole.USER);

		// Sanitize the user object
		const sanitizedUser = sanitizeObject(user.toObject());

		return { user: sanitizedUser };
	}

	@Put('user')
	async updateUserById(@Body('email') id: string, @Body() updates: UpdateUserDto): Promise<{ message: string; user?: Partial<UserDocument> }> {
		const updatedUser = await this.authService.updateUser(id, updates);

		if (!updatedUser) {
			throw new BadRequestException('User update failed.');
		}

		// Define the keys you want to remove
		const keysToRemove = ['__v']; // Add any additional keys as needed

		// Sanitize the user object
		const sanitizedUser = sanitizeObject(updatedUser.toObject(), keysToRemove);

		return { message: 'User updated successfully.', user: sanitizedUser };
	}

	@Post('generate-token')
	async generateToken(@Body() createTokenDto: CreateTokenDto): Promise<{ token: string }> {
		const { email } = createTokenDto;

		const token: string = await this.authService.generateToken(email);

		return { token };
	}
}
