// src/auth/auth.service.ts

import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';
import { GetUserDto } from '../dto/user/get-user.dto';
import { UserRole } from '../dto/user/roles.enum';
import { UpdateUserDto } from '../dto/user/update-user.dto';

@Injectable()
export class AuthService {
	readonly logger = new Logger(AuthService.name);

	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	async getUser(params: GetUserDto): Promise<UserDocument> {
		let user: UserDocument | null = null;

		if (params.id) {
			// Find by MongoDB ObjectId
			try {
				user = await this.userModel.findById(params.id);
			} catch (error) {
				this.logger.warn(`Invalid ObjectId format: ${params.id}`);
				throw new BadRequestException('Invalid id format');
			}
		} else if (params.email) {
			user = await this.userModel.findOne({ email: params.email });
		} else if (params.token) {
			user = await this.userModel.findOne({ token: params.token });
		}

		if (user && !user.role) {
			user.role = UserRole.USER;
			await user.save();
			this.logger.log(`Assigned default role to user ${user.email}`);
		}

		return user;
	}

	async createUser(email: string, role: UserRole): Promise<UserDocument> {
		this.logger.debug(`Attempting to create user with email: ${email} and role: ${role}`);

		const existingUser: UserDocument | null = await this.getUser({ email });

		if (existingUser) {
			this.logger.warn(`Email ${email} is already in use.`);
			throw new BadRequestException(`Email ${email} is already in use.`);
		}

		const token: string = crypto.randomBytes(16).toString('hex');
		this.logger.debug(`Generated token: ${token} for user: ${email}`);

		const user: UserDocument = new this.userModel({ email, token, role });

		try {
			await user.save();
			this.logger.log(`User created successfully with email: ${email}`);
		} catch (error) {
			this.logger.error(`Error creating user with email: ${email}`, error);
			throw new BadRequestException('Failed to create user due to a database error.');
		}

		return user;
	}

	async updateUser(email: string, updates: UpdateUserDto): Promise<UserDocument | null> {
		const user = await this.userModel.findOne({ email });

		if (!user) {
			throw new NotFoundException(`User with email: ${email} not found.`);
		}

		const fieldsToUpdate: Partial<UserDocument> = {};

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
			return user;
		}

		// Perform the update
		try {
			const updatedUser = await this.userModel.findByIdAndUpdate(user._id, { $set: fieldsToUpdate }, { new: true });
			return updatedUser;
		} catch (error) {
			this.logger.error(`Error updating user with email: ${email}`, error);
			throw new BadRequestException('Failed to update user due to a database error.');
		}
	}

	async generateToken(id: string): Promise<string> {
		const token: string = crypto.randomBytes(16).toString('hex'); // 32 characters

		// Find user by email
		const existingUser: any = await this.getUser({ id });

		if (!existingUser) {
			throw new NotFoundException(`User with email: ${id} not found.`);
		}

		// If the user already has a token, replace it
		if (existingUser.token) {
			const updates = { token };
			await this.updateUser(id, updates);
		} else {
			// Assign the new token
			existingUser.token = token;
			await existingUser.save();
		}

		return token;
	}

	async validateToken(token: string): Promise<boolean> {
		const user = await this.userModel.findOne({ token });
		return !!user;
	}
}
