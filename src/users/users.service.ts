// src/users/users.service.ts

import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
	User,
	UserDocument
} from '../database/mongoose/schemas/user.schema';
import { UpdateUserDto } from './dtos/update-user.dto';

@Injectable()
export class UsersService {
	readonly logger = new Logger(UsersService.name);

	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>
	) {}

	async getUserById(userId: string): Promise<UserDocument> {
		const user = await this.userModel.findById(userId);
		if (!user) {
			throw new NotFoundException(`User with id ${userId} not found.`);
		}
		return user;
	}

	async updateUser(
		authenticatedUser: UserDocument,
		updates: UpdateUserDto
	): Promise<{ user: UserDocument; updated: boolean }> {
		const user = await this.userModel.findById(authenticatedUser._id);

		if (!user) {
			throw new NotFoundException(`User not found.`);
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
				`Error updating user with id ${user._id}.`,
				error
			);
			throw new BadRequestException(
				'Failed to update user due to a database error.'
			);
		}
	}
}
