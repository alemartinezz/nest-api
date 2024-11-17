// src/auth/auth.service.ts

import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { sanitizeObject } from 'src/common/utils/object.util';
import { User, UserDocument } from '../database/schemas/user.schema';
import { GetUserDto } from '../dto/user/get-user.dto';
import { UserRole } from '../dto/user/roles.enum';
import { UpdateUserDto } from '../dto/user/update-user.dto';

@Injectable()
export class AuthService {
	readonly logger = new Logger(AuthService.name);

	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>
	) {}

	async getUser(params: GetUserDto): Promise<Partial<UserDocument>> {
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

		const sanitizedUser = sanitizeObject(user.toObject());
		return sanitizedUser;
	}

	async createUser(
		email: string,
		role: UserRole
	): Promise<Partial<UserDocument>> {
		this.logger.debug(
			`Attempting to create user with email: ${email} and role: ${role}`
		);

		email = email.toLowerCase();

		const existingUser = await this.userModel.findOne({ email }).exec();
		if (existingUser) {
			this.logger.warn(`Email ${email} is already in use.`);
			throw new BadRequestException(
				`Email ${email} is already in use.`
			);
		}

		const token: string = crypto.randomBytes(16).toString('hex');
		this.logger.debug(`Generated token: ${token} for user: ${email}`);

		const user = new this.userModel({ email, token, role });

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

		const sanitizedUser = sanitizeObject(user.toObject());
		return sanitizedUser;
	}

	async updateUser(
		authenticatedUser: UserDocument,
		params: GetUserDto,
		updates: UpdateUserDto
	): Promise<{ user: Partial<UserDocument>; updated: boolean }> {
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
			} else if (user[key] !== value) {
				fieldsToUpdate[key] = value;
			}
		}

		if (Object.keys(fieldsToUpdate).length === 0) {
			const sanitizedUser = sanitizeObject(user.toObject(), ['__v']);
			return { user: sanitizedUser, updated: false };
		}

		try {
			const updatedUser = await this.userModel.findByIdAndUpdate(
				user._id,
				{ $set: fieldsToUpdate },
				{ new: true }
			);

			const sanitizedUser = sanitizeObject(updatedUser.toObject(), [
				'__v'
			]);
			return { user: sanitizedUser, updated: true };
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

	async generateToken(email: string): Promise<string> {
		email = email.toLowerCase();

		const existingUser = await this.userModel.findOne({ email }).exec();

		if (!existingUser) {
			throw new NotFoundException(
				`User with email: ${email} not found.`
			);
		}

		const token: string = crypto.randomBytes(16).toString('hex');

		existingUser.token = token;
		await existingUser.save();

		return token;
	}
}
