// src/auth/auth.controller.ts

import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	Put,
	Query,
	Req
} from '@nestjs/common';
import { Request } from 'express';
import { sanitizeObject } from 'src/common/utils/object.util';
import { UserDocument } from 'src/database/schemas/user.schema';
import { ChangePasswordDto } from 'src/dto/user/change-password.dto';
import { GetUserDto } from 'src/dto/user/get-user.dto';
import { ResendVerificationDto } from 'src/dto/user/resend-verification.dto';
import { signUpDto } from 'src/dto/user/sign-up.dto';
import { UpdateUserDto } from 'src/dto/user/update-user.dto';
import { VerifyEmailDto } from 'src/dto/user/verify-email.dto';
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

		const sanitizedUser = sanitizeObject(user.toObject());

		return { user: sanitizedUser };
	}

	@Public()
	@Post('signup')
	async signUp(
		@Body() signUpDto: signUpDto
	): Promise<{ user: Partial<UserDocument> }> {
		const { email, password } = signUpDto;

		const user = await this.authService.signUp(email, password);

		const sanitizedUser = sanitizeObject(user.toObject());

		return { user: sanitizedUser };
	}

	@Public()
	@Post('login')
	@HttpCode(200)
	async login(
		@Body() loginDto: signUpDto
	): Promise<{ user: Partial<UserDocument> }> {
		const { email, password } = loginDto;

		const user = await this.authService.login(email, password);

		const sanitizedUser = sanitizeObject(user.toObject());

		return { user: sanitizedUser };
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

		const sanitizedUser = sanitizeObject(user.toObject());

		const message = updated
			? 'User updated successfully.'
			: 'No changes detected.';

		return { message, user: sanitizedUser };
	}

	@Put('reset-password')
	async resetPassword(
		@Req() request: Request,
		@Body() changePasswordDto: ChangePasswordDto
	): Promise<{ message: string }> {
		const authenticatedUser = request.user;

		await this.authService.resetPassword(
			authenticatedUser,
			changePasswordDto
		);

		return { message: 'Password updated successfully.' };
	}

	@Get('regenerate-token')
	async generateToken(
		@Req() request: Request
	): Promise<{ token: string }> {
		const authenticatedUser = request.user;

		const token: string =
			await this.authService.regenerateToken(authenticatedUser);

		return { token };
	}

	@Public()
	@Post('verify-email')
	async verifyEmail(
		@Body() verifyEmailDto: VerifyEmailDto
	): Promise<{ message: string }> {
		const { email, code } = verifyEmailDto;

		await this.authService.verifyEmail(email, code);

		return { message: 'Email verified successfully.' };
	}

	@Public()
	@Post('resend-verification-code')
	async resendVerificationCode(
		@Body() resendVerificationDto: ResendVerificationDto
	): Promise<{ message: string }> {
		const { email } = resendVerificationDto;

		await this.authService.resendVerificationCode(email);

		return { message: 'Verification code resent successfully.' };
	}
}
