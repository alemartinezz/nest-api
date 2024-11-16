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

	async getUserById(id: string): Promise<UserDocument> {
		const user = await this.userModel.findById(id);
		if (
			user &&
			!user.role // If the user has no role, assign the default role
		) {
			user.role = UserRole.USER;
			await user.save();
			this.logger.log(`Assigned default role to user ${user.email}`);
		}
		return user;
	}

	async getUserByEmail(email: string): Promise<UserDocument> {
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

	async getUserByToken(token: string): Promise<UserDocument> {
		const user = await this.userModel.findOne({ token });
		if (user) {
			if (!user.role) {
				user.role = UserRole.USER;
				await user.save();
				this.logger.log(`Assigned default role to user ${user.email}`);
			}
			return { id: user.id, email: user.email, role: user.role, token: user.token } as UserDocument;
		} else {
			return null;
		}
	}

	async createUser(email: string, role: UserRole): Promise<UserDocument> {
		// Check if the email is already in use
		const existingUser = await this.getUserByEmail(email);

		if (existingUser) {
			throw new BadRequestException(`Email ${email} is already in use.`);
		}

		// 1. Generate token
		const token = crypto.randomBytes(16).toString('hex');

		// Create the user
		const user = new this.userModel({ email, token, role });

		return user;
	}

	async generateToken(email: string): Promise<string> {
		const token: string = crypto.randomBytes(16).toString('hex'); // 32 caracteres

		// Verifica si el usuario ya tiene token
		const existingUser = await this.getUserByEmail(email);

		// Si ya tenia token, se reemplaza
		if (!existingUser.token) {
			const updates = { token };

			await this.updateUser(existingUser.id, updates);
		}

		return token;
	}

	async updateUser(id: string, updates: UpdateUserDto): Promise<UserDocument | null> {
		const user = await this.userModel.findById(id);

		if (!user) {
			throw new NotFoundException(`User with id: ${id} not found.`);
		}

		const fieldsToUpdate: Partial<User> = {};

		// Iterate through updates and check for differences
		for (const [key, value] of Object.entries(updates)) {
			// Ensure the key exists in the user schema
			if (!(key in user)) {
				continue; // Skip unknown fields
			}

			// Check if the value is different
			if (user[key] !== value) {
				// Special handling for email to check uniqueness
				if (key === 'email') {
					const existingUser = await this.userModel.findOne({ email: value });
					if (existingUser && existingUser._id.toString() !== user._id.toString()) {
						throw new BadRequestException(`Email ${value} is already in use.`);
					}
				}
				fieldsToUpdate[key] = value;
			}
		}

		if (Object.keys(fieldsToUpdate).length === 0) {
			// No changes detected
			throw new BadRequestException('No changes detected.');
		}

		// Perform the update
		const updatedUser = await this.userModel.findOneAndUpdate({ id }, { $set: fieldsToUpdate }, { new: true });

		return updatedUser;
	}

	async validateToken(token: string): Promise<boolean> {
		const user = await this.userModel.findOne({ token });
		return !!user;
	}
}
