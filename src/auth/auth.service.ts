// src/auth/auth.service.ts

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from './roles.enum';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class AuthService {
	readonly logger = new Logger(AuthService.name);

	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	generateToken(): string {
		return crypto.randomBytes(16).toString('hex'); // 32 caracteres
	}

	async createUser(token: string, email: string, role: UserRole = UserRole.USER): Promise<void> {
		const user = new this.userModel({ token, email, role });
		await user.save();
	}

	async validateToken(token: string): Promise<boolean> {
		const user = await this.userModel.findOne({ token });
		return !!user;
	}

	async findUserByEmail(email: string): Promise<UserDocument> {
		const user = await this.userModel.findOne({ email });
		if (user && !user.role) {
			user.role = UserRole.USER;
			await user.save();
			this.logger.log(`Assigned default role to user ${email}`);
		}
		return { email: user.email, role: user.role, token: user.token } as UserDocument;
	}

	async findUserByToken(token: string): Promise<UserDocument> {
		const user = await this.userModel.findOne({ token });
		if (user && !user.role) {
			user.role = UserRole.USER;
			await user.save();
			this.logger.log(`Assigned default role to token ${token}`);
		}
		return user;
	}

	async updateUserToken(email: string, token: string): Promise<void> {
		await this.userModel.updateOne({ email }, { token });
	}

	async updateUserRole(email: string, role: UserRole): Promise<void> {
		await this.userModel.updateOne({ email }, { role });
	}

	/**
	 * Updates a user's email and/or role.
	 * @param currentEmail The current email of the user to identify them.
	 * @param updates An object containing the new email and/or role.
	 */
	async updateUser(currentEmail: string, updates: UpdateUserDto): Promise<UserDocument> {
		const user = await this.userModel.findOne({ email: currentEmail });
		if (!user) {
			throw new NotFoundException(`User with email ${currentEmail} not found.`);
		}

		if (updates.email) {
			// Check if the new email is already taken
			const existingUser = await this.userModel.findOne({ email: updates.email });
			if (existingUser && existingUser._id.toString() !== user._id.toString()) {
				throw new BadRequestException(`Email ${updates.email} is already in use.`);
			}
			user.email = updates.email;
		}

		if (updates.role) {
			user.role = updates.role;
		}

		await user.save();
		return user;
	}

	/**
	 * Retrieves a user's token based on their email.
	 * @param email The email of the user.
	 * @returns The token string.
	 */
	async getTokenByEmail(email: string): Promise<string> {
		const user = await this.userModel.findOne({ email });
		if (!user) {
			throw new NotFoundException(`User with email ${email} not found.`);
		}
		return user.token;
	}
}
