// src/auth/auth.service.ts

import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
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
		if (user) {
			if (!user.role) {
				user.role = UserRole.USER;
				await user.save();
				this.logger.log(`Assigned default role to user ${email}`);
			}
			return { id: user.id, email: user.email, role: user.role, token: user.token } as UserDocument;
		} else {
			return null;
		}
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

	async getTokenByEmail(email: string): Promise<string> {
		const user = await this.userModel.findOne({ email });
		if (!user) {
			throw new NotFoundException(`User with email ${email} not found.`);
		}
		return user.token;
	}

	async createUserWithUUID(email: string): Promise<UserDocument> {
		const existingUser = await this.userModel.findOne({ email });
		if (existingUser) {
			throw new ConflictException('User with this email already exists');
		}
		const uuid = uuidv4();
		const user = new this.userModel({ email, uuid, role: UserRole.USER });
		await user.save();
		return user;
	}
}
