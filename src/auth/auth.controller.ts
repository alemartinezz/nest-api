// src/auth/auth.controller.ts

import { Body, Controller, Get, NotFoundException, Post, Put, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserByEmailDto } from './dto/get-user-by-email.dto';
import { GetUserByIdDto } from './dto/get-user-by-id';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from './public.decorator';
import { UserRole } from './roles.enum';
import { UserDocument } from './schema/user.schema';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Get('get-user-by-id')
	async getUserById(@Query() params: GetUserByIdDto): Promise<{ user: UserDocument }> {
		const user = await this.authService.getUserById(params.id);

		if (!user) {
			throw new NotFoundException(`User with id ${params.id} not found.`);
		}

		return { user };
	}

	@Public()
	@Get('get-user-by-email')
	async getUserByEmail(@Query() params: GetUserByEmailDto): Promise<{ user: UserDocument }> {
		const user = await this.authService.getUserByEmail(params.email);

		if (!user) {
			throw new NotFoundException(`User with email ${params.email} not found.`);
		}

		return { user };
	}

	@Public()
	@Post('create-user')
	async createUser(@Body() createUserDto: CreateUserDto): Promise<{ user: UserDocument }> {
		const { email, role } = createUserDto;

		const user = await this.authService.createUser(email, role ?? UserRole.USER);

		return { user };
	}

	@Post('generate-token')
	async generateToken(@Body() createTokenDto: CreateTokenDto): Promise<{ token: string }> {
		const { email } = createTokenDto;

		const token: string = await this.authService.generateToken(email);

		return { token };
	}

	@Put('update-user')
	async updateUser(@Body('currentEmail') currentEmail: string, @Body() updates: UpdateUserDto): Promise<{ message: string; user?: any }> {
		const updatedUser = await this.authService.updateUser(currentEmail, updates);

		if (!updatedUser) {
		}

		return { message: 'User updated successfully.', user: updatedUser };
	}
}
