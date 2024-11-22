// src/modules/auth/auth.controller.ts

import { Body, Controller, Post, Put } from '@nestjs/common';
import { UserRole } from 'src/modules/auth/dtos/roles.enum';
import { UserDocument } from '../mongoose/schemas/user.schema';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { ResendVerificationDto } from './dtos/resend-verification.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { SignUpDto } from './dtos/sign-up.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('signup')
	async signUp(
		@Body() signUpDto: SignUpDto
	): Promise<{ user: Partial<UserDocument> }> {
		const { email, password } = signUpDto;

		const user = await this.authService.signUp(email, password);

		return { user };
	}

	@Public()
	@Post('login')
	async login(@Body() signInDto: SignInDto): Promise<{ token: string }> {
		const { email, password } = signInDto;

		const { token } = await this.authService.login(email, password);

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

	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@Put('reset-password')
	async resetPassword(
		@CurrentUser() authenticatedUser: UserDocument,
		@Body() changePasswordDto: ChangePasswordDto
	): Promise<{ message: string }> {
		await this.authService.resetPassword(
			authenticatedUser,
			changePasswordDto
		);

		return { message: 'Password updated successfully.' };
	}

	@Roles(UserRole.ADMIN, UserRole.BASIC)
	@Post('resend-verification-code')
	async resendVerificationCode(
		@Body() resendVerificationDto: ResendVerificationDto
	): Promise<{ message: string }> {
		const { email } = resendVerificationDto;

		await this.authService.resendVerificationCode(email);

		return { message: 'Verification code resent successfully.' };
	}
}
