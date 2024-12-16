// src/features/users/users.controller.ts
import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Put,
	Query
} from '@nestjs/common';
import { Public } from '../../modules/auth/decorators/public.decorator';
import { UserRole } from '../../modules/auth/dtos/roles.guards.dto';
import { UserDocument } from '../../modules/mongoose/schemas/user.schema';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { GetUserDto } from './dtos/get-user.dto';
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
	@HttpCode(HttpStatus.CREATED)
	async signUp(@Body() signUpDto: SignUpDto): Promise<{ user: UserResponseDto; messages: string }> {
		const {
			email, password
		} = signUpDto;

		const userDto = await this.usersService.signUp(
			email,
			password
		);

		return {
			user: userDto,
			messages: 'User created successfully'
		};
	}
	@Public()
	@Post('login')
	@HttpCode(HttpStatus.OK)
	async login(@Body() signInDto: SignInDto): Promise<{ user: UserResponseDto; messages: string }> {
		const {
			email, password
		} = signInDto;

		const {
			user
		} = await this.usersService.login(
			email,
			password
		);

		return {
			user,
			messages: 'Login successful'
		};
	}

	@Public()
	@Post('verify-email')
	@HttpCode(HttpStatus.OK)
	async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ messages: string }> {
		const {
			email, code
		} = verifyEmailDto;

		await this.usersService.verifyEmail(
			email,
			code
		);

		return {
			messages: 'Email verified successfully.'
		};
	}
	@Public()
	@Post('resend-verification-code')
	@HttpCode(HttpStatus.OK)
	async resendVerificationCode(@Body() resendVerificationDto: ResendVerificationDto): Promise<{ messages: string }> {
		const {
			email
		} = resendVerificationDto;

		await this.usersService.resendVerificationCode(email);

		return {
			messages: 'Verification code resent successfully.'
		};
	}

	@Roles(
		UserRole.ADMIN,
		UserRole.BASIC
	)
	@Put('reset-password')
	@HttpCode(HttpStatus.OK)
	async resetPassword(
		@CurrentUser() authenticatedUser: UserDocument,
		@Body() changePasswordDto: ChangePasswordDto
	): Promise<{ messages: string }> {
		await this.usersService.resetPassword(
			authenticatedUser,
			changePasswordDto
		);

		return {
			messages: 'Password updated successfully.'
		};
	}

	@Roles(
		UserRole.ADMIN,
		UserRole.BASIC
	)
	@HttpCode(HttpStatus.OK)
	@Get('me')
	async getProfile(@CurrentUser() authenticatedUser: UserDocument): Promise<{ user: UserResponseDto; messages: string }> {
		const userDto = await this.usersService.getUserById(authenticatedUser.id);

		return {
			user: userDto,
			messages: 'Profile retrieved successfully.'
		};
	}

	@Roles(
		UserRole.ADMIN,
		UserRole.BASIC
	)
	@HttpCode(HttpStatus.OK)
	@Put('me')
	async updateProfile(
		@CurrentUser() authenticatedUser: UserDocument,
		@Body() updates: UpdateUserDto
	): Promise<{ user: UserResponseDto; messages: string }> {
		const {
			user, changesDetected
		} = await this.usersService.updateUser(
			authenticatedUser,
			updates
		);

		if (!changesDetected) {
			return {
				user,
				messages: 'No changes detected.'
			};
		}

		return {
			user,
			messages: 'Profile updated successfully.'
		};
	}

	@Roles(UserRole.ADMIN)
	@HttpCode(HttpStatus.OK)
	@Get()
	async getUserById(@Query() params: GetUserDto): Promise<{ user: UserResponseDto; messages: string }> {
		const userDto = await this.usersService.getUserById(params.id);

		return {
			user: userDto,
			messages: 'User retrieved successfully.'
		};
	}

	@Roles(UserRole.ADMIN)
	@HttpCode(HttpStatus.OK)
	@Put()
	async updateUserById(
		@Query() params: GetUserDto,
		@Body() updates: UpdateUserDto
	): Promise<{ user: UserResponseDto; messages: string }> {
		const {
			user, changesDetected
		} =
			await this.usersService.updateUserById(
				params,
				updates
			);

		if (!changesDetected) {
			return {
				user,
				messages: 'No changes detected.'
			};
		}

		return {
			user,
			messages: 'User updated successfully.'
		};
	}
}
