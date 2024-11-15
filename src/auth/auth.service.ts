// src/auth/auth.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class AuthService {
	readonly logger = new Logger(AuthService.name);
	private readonly encryptionKey: Buffer;

	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
		this.encryptionKey = crypto.randomBytes(32); // Generate a random 256-bit key
	}

	generateClientId(): string {
		return randomUUID();
	}

	generateToken(): string {
		return crypto.randomBytes(64).toString('hex'); // Generate a 128-character hexadecimal token
	}

	async createUser(clientId: string, token: string, email: string): Promise<void> {
		const user = new this.userModel({ clientId, token, email });
		await user.save();
	}

	async validateToken(clientId: string, token: string): Promise<boolean> {
		const user = await this.userModel.findOne({ clientId, token });
		return !!user;
	}

	async findUserByToken(token: string): Promise<UserDocument> {
		return this.userModel.findOne({ token });
	}
}
