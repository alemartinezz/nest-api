// src/features/users/users.controller.ts

import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Put
} from '@nestjs/common';
import { Public } from 'src/modules/auth/decorators/public.decorator';
import { UserDocument } from 'src/modules/mongoose/schemas/user.schema';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { UserRole } from '../../modules/auth/dtos/roles.enum';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { MyUsersService } from './users.service';
@Controller('users')
export class MyUsersController {
	constructor(private readonly usersService: MyUsersService) {}
	@Public()
	@Post('signup')
	@HttpCode(HttpStatus.CREATED) // 201
	async signUp(
		@Body() signUpDto: SignUpDto
	): Promise<{ user: UserResponseDto }> {
		const { email, password } = signUpDto;
		const userDto = await this.usersService.signUp(email, password);
		return { user: userDto };
	}
	@Public()
	@Post('login')
	@HttpCode(HttpStatus.OK) // Explicitly set to 200
	async login(
		@Body() signInDto: SignInDto
	): Promise<{ user: UserResponseDto; messages: string }> {
		const { email, password } = signInDto;
		const { user, messages } = await this.usersService.login(
			email,
			password
		);
		return { user, messages };
	}
	@Public()
	@Post('verify-email')
	@HttpCode(HttpStatus.OK) // 200
	async verifyEmail(
		@Body() verifyEmailDto: VerifyEmailDto
	): Promise<{ messages: string }> {
		const { email, code } = verifyEmailDto;
		await this.usersService.verifyEmail(email, code);
		return { messages: 'Email verified successfully.' };
	}
	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@Put('reset-password')
	@HttpCode(HttpStatus.OK) // 200
	async resetPassword(
		@CurrentUser() authenticatedUser: UserDocument,
		@Body() changePasswordDto: ChangePasswordDto
	): Promise<{ messages: string }> {
		await this.usersService.resetPassword(
			authenticatedUser,
			changePasswordDto
		);
		return { messages: 'Password updated successfully.' };
	}
	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@Post('resend-verification-code')
	@HttpCode(HttpStatus.OK) // 200
	async resendVerificationCode(
		@Body() resendVerificationDto: ResendVerificationDto
	): Promise<{ messages: string }> {
		const { email } = resendVerificationDto;
		await this.usersService.resendVerificationCode(email);
		return { messages: 'Verification code resent successfully.' };
	}
	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@HttpCode(HttpStatus.OK)
	@Get('me')
	async getProfile(
		@CurrentUser() authenticatedUser: UserDocument
	): Promise<{ user: UserResponseDto }> {
		const userDto = await this.usersService.getUserById(
			authenticatedUser.id
		);
		return { user: userDto };
	}
	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@HttpCode(HttpStatus.OK)
	@Put('me')
	async updateProfile(
		@CurrentUser() authenticatedUser: UserDocument,
		@Body() updates: UpdateUserDto
	): Promise<{ user: UserResponseDto }> {
		const { user } = await this.usersService.updateUser(
			authenticatedUser,
			updates
		);
		return { user };
	}
}
