// src/auth/auth.controller.ts

// src/auth/auth.controller.ts

import {
	Body,
	Controller,
	Get,
	Post,
	Put,
	Query,
	Req
} from '@nestjs/common';
import { Request } from 'express';
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
	async getUser(
		@Query() params: GetUserDto
	): Promise<{ user: Partial<UserDocument> }> {
		const user = await this.authService.getUser(params);
		return { user };
	}

	@Public()
	@Post('user')
	async createUser(
		@Body() createUserDto: CreateUserDto
	): Promise<{ user: Partial<UserDocument> }> {
		const { email, role } = createUserDto;
		const user = await this.authService.createUser(
			email,
			role ?? UserRole.USER
		);
		return { user };
	}

	@Put('user')
	async updateUser(
		@Req() request: Request,
		@Query() params: GetUserDto,
		@Body() updates: UpdateUserDto
	): Promise<{ message: string; user?: Partial<UserDocument> }> {
		const authenticatedUser = request.user;
		const { user, updated } = await this.authService.updateUser(
			authenticatedUser,
			params,
			updates
		);
		const message = updated
			? 'User updated successfully.'
			: 'No changes detected.';
		return { message, user };
	}

	@Post('generate-token')
	async generateToken(
		@Body() createTokenDto: CreateTokenDto
	): Promise<{ token: string }> {
		const { email } = createTokenDto;
		const token: string = await this.authService.generateToken(email);
		return { token };
	}
}
