// src/auth/auth.controller.ts

import { BadRequestException, Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from './public.decorator';
import { UserRole } from './roles.enum';
import { UserDocument } from './schema/user.schema';

// TODO: Unify getUser for accepting both or either email or id

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Get('user')
	async getUser(@Query() params: GetUserDto): Promise<{ user: UserDocument }> {
		if (!params.id && !params.email) {
			throw new BadRequestException('Either id or email must be provided');
		}

		let user: UserDocument;

		if (params.id) {
			user = await this.authService.getUser(params);
		} else {
			user = await this.authService.getUser(params);
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
