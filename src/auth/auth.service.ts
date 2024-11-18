// src/auth/auth.service.ts

import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';
import { ChangePasswordDto } from '../dto/user/change-password.dto';
import { GetUserDto } from '../dto/user/get-user.dto';
import { UserRole } from '../dto/user/roles.enum';
import { UpdateUserDto } from '../dto/user/update-user.dto';

@Injectable()
export class AuthService {
	readonly logger = new Logger(AuthService.name);

	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>
	) {}

	async signUp(email: string, password: string): Promise<UserDocument> {
		this.logger.debug(`Attempting to create user with email: ${email}`);

		// 1. Normalize input
		email = email.toLowerCase();

		// 2. Check if user already exists
		const existingUser = await this.userModel.findOne({ email }).exec();
		if (existingUser) {
			this.logger.warn(`Email ${email} is already in use.`);
			throw new BadRequestException(
				`Email ${email} is already in use.`
			);
		}

		// 3. Hash password using Argon2
		let hashedPassword: string;
		try {
			hashedPassword = await argon2.hash(password, {
				type: argon2.argon2id,
				memoryCost: 2 ** 16, // 64 MB
				timeCost: 3,
				parallelism: 1
			});
		} catch (error) {
			this.logger.error('Error hashing password', error);
			throw new BadRequestException('Failed to hash password.');
		}

		// 4. Create user with email and hashed password
		const user = new this.userModel({
			email,
			emailVerified: false,
			password: hashedPassword,
			token: crypto.randomBytes(16).toString('hex'),
			role: UserRole.USER
		});

		try {
			await user.save();
			this.logger.log(
				`User created successfully with email: ${email}`
			);
		} catch (error) {
			this.logger.error(
				`Error creating user with email: ${email}`,
				error
			);
			throw new BadRequestException(
				'Failed to create user due to a database error.'
			);
		}

		return user;
	}

	async login(email: string, password: string): Promise<UserDocument> {
		email = email.toLowerCase();

		// Include 'password' in the selection
		const user = await this.userModel
			.findOne({ email })
			.select('+password') // Ensure password is selected
			.exec();

		if (!user) {
			throw new NotFoundException(
				`User with email: ${email} not found.`
			);
		}

		// Verify the incoming password with the stored hashed password
		let isPasswordValid: boolean;
		try {
			isPasswordValid = await argon2.verify(user.password, password);
		} catch (error) {
			this.logger.error('Error verifying password', error);
			throw new UnauthorizedException('Invalid password.');
		}

		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid password.');
		}

		return user;
	}

	async getUser(params: GetUserDto): Promise<UserDocument> {
		if (!params.id && !params.email && !params.token) {
			throw new BadRequestException(
				'At least one of id, email, or token must be provided.'
			);
		}

		let user: UserDocument | null = null;

		if (params.id) {
			user = await this.userModel.findById(params.id);
		} else if (params.email) {
			user = await this.userModel.findOne({ email: params.email });
		} else if (params.token) {
			user = await this.userModel.findOne({ token: params.token });
		}

		if (!user) {
			throw new NotFoundException(
				`User not found with provided parameters.`
			);
		}

		if (!user.role) {
			user.role = UserRole.USER;
			await user.save();
			this.logger.log(`Assigned default role to user ${user.email}`);
		}

		return user;
	}

	async updateUser(
		authenticatedUser: UserDocument,
		params: GetUserDto,
		updates: UpdateUserDto
	): Promise<{ user: UserDocument; updated: boolean }> {
		if (
			(params.id && params.id !== authenticatedUser._id.toString()) ||
			(params.email && params.email !== authenticatedUser.email)
		) {
			throw new UnauthorizedException(
				'You can only update your own data.'
			);
		}

		const userId = authenticatedUser._id.toString();
		const user = await this.userModel.findById(userId);

		if (!user) {
			throw new NotFoundException(`User with id ${userId} not found.`);
		}

		const fieldsToUpdate: Partial<UserDocument> = {};

		for (const [key, value] of Object.entries(updates)) {
			if (!(key in user)) {
				continue;
			}

			if (key === 'email') {
				const normalizedEmail = value.toLowerCase();
				if (user.email.toLowerCase() !== normalizedEmail) {
					const existingUser = await this.userModel
						.findOne({ email: normalizedEmail })
						.exec();
					if (
						existingUser &&
						existingUser._id.toString() !== user._id.toString()
					) {
						throw new BadRequestException(
							`Email ${value} is already in use.`
						);
					}
					fieldsToUpdate[key] = normalizedEmail;
				}
			} else {
				if (user[key] !== value) {
					fieldsToUpdate[key] = value;
				}
			}
		}

		if (Object.keys(fieldsToUpdate).length === 0) {
			return { user, updated: false };
		}

		try {
			const updatedUser = await this.userModel.findByIdAndUpdate(
				user._id,
				{ $set: fieldsToUpdate },
				{ new: true }
			);

			return { user: updatedUser, updated: true };
		} catch (error) {
			this.logger.error(
				`Error updating user with id ${userId}.`,
				error
			);
			throw new BadRequestException(
				'Failed to update user due to a database error.'
			);
		}
	}

	async resetPassword(
		authenticatedUser: UserDocument,
		changePasswordDto: ChangePasswordDto
	): Promise<{ message: string }> {
		const { currentPassword, newPassword } = changePasswordDto;

		// Verify current password
		let isPasswordValid: boolean;
		try {
			isPasswordValid = await argon2.verify(
				authenticatedUser.password,
				currentPassword
			);
		} catch (error) {
			this.logger.error('Error verifying current password', error);
			throw new UnauthorizedException('Invalid current password.');
		}

		if (!isPasswordValid) {
			throw new UnauthorizedException('Invalid current password.');
		}

		// Hash the new password
		let hashedNewPassword: string;
		try {
			hashedNewPassword = await argon2.hash(newPassword, {
				type: argon2.argon2id,
				memoryCost: 2 ** 16, // 64 MB
				timeCost: 3,
				parallelism: 1
			});
		} catch (error) {
			this.logger.error('Error hashing new password', error);
			throw new BadRequestException('Failed to hash new password.');
		}

		// Update the user's password
		authenticatedUser.password = hashedNewPassword;

		try {
			await authenticatedUser.save();
			this.logger.log(
				`Password updated successfully for user ${authenticatedUser.email}`
			);
		} catch (error) {
			this.logger.error('Error saving new password', error);
			throw new BadRequestException(
				'Failed to update password due to a database error.'
			);
		}

		return { message: 'Password updated successfully.' };
	}

	// use updateUser method to update user's token
	async regenerateToken(authenticatedUser: UserDocument): Promise<string> {
		const token = crypto.randomBytes(16).toString('hex');

		try {
			await this.userModel.findByIdAndUpdate(authenticatedUser._id, {
				$set: { token }
			});
		} catch (error) {
			this.logger.error(
				`Error regenerating token for user ${authenticatedUser.email}`,
				error
			);
			throw new BadRequestException(
				'Failed to regenerate token due to a database error.'
			);
		}

		return token;
	}
}
