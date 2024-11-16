// src/auth/auth.controller.ts

import { Body, Controller, Get, NotFoundException, Post, Put, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUserByEmailDto } from './dto/get-user-by-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from './public.decorator';
import { UserRole } from './roles.enum';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('create-user')
	async createUser(@Body() createUserDto: CreateUserDto): Promise<{ user: any }> {
		const { email } = createUserDto;
		const user = await this.authService.createUserWithUUID(email);
		return { user };
	}

	@Public()
	@Get('get-user-by-email')
	async getUserByEmail(@Query() params: GetUserByEmailDto): Promise<{ user: any }> {
		const user = await this.authService.findUserByEmail(params.email);
		if (!user) {
			throw new NotFoundException(`User with email ${params.email} not found.`);
		}
		return { user };
	}

	@Post('generate-token')
	async generateToken(@Body() createTokenDto: CreateTokenDto): Promise<{ token: string }> {
		const { email, role } = createTokenDto;

		// Verifica si el usuario ya existe
		const existingUser = await this.authService.findUserByEmail(email);

		if (existingUser) {
			if (existingUser.role !== role) {
				// Actualiza el rol si es diferente
				await this.authService.updateUserRole(email, role);
			}
			// Retorna el token existente
			return { token: existingUser.token };
		} else {
			// Crea un nuevo usuario
			const token = this.authService.generateToken();

			await this.authService.createUser(token, email, role || UserRole.USER);

			return { token };
		}
	}

	@Put('update-user')
	async updateUser(@Body('currentEmail') currentEmail: string, @Body() updates: UpdateUserDto): Promise<{ message: string; user: any }> {
		const updatedUser = await this.authService.updateUser(currentEmail, updates);
		return { message: 'User updated successfully.', user: updatedUser };
	}
}
