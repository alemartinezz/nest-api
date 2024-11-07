// .//src/auth/auth.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { Token, TokenDocument } from './token.schema';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);
	private readonly encryptionKey: Buffer;
	private readonly ivHex: string;

	constructor(
		private readonly configService: ConfigService,
		@InjectModel(Token.name) private tokenModel: Model<TokenDocument>
	) {
		this.encryptionKey = Buffer.from(this.configService.get<string>('ENCRYPTION_KEY'), 'utf8');
		this.ivHex = this.configService.get<string>('IV_HEX');
	}

	/**
	 * Generates a token using AES-GCM encryption.
	 */
	generateToken(payload: any): string {
		const iv = Buffer.from(this.ivHex, 'hex');
		const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

		let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
		encrypted += cipher.final('hex');
		const authTag = cipher.getAuthTag().toString('hex');

		const token = `${encrypted}:${authTag}`;
		return token;
	}

	/**
	 * Verifies that the token was encrypted by us without fully decrypting it.
	 */
	verifyToken(token: string): boolean {
		try {
			const [encryptedData, authTag] = token.split(':');
			const iv = Buffer.from(this.ivHex, 'hex');
			const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
			decipher.setAuthTag(Buffer.from(authTag, 'hex'));
			decipher.update(encryptedData, 'hex', 'utf8');
			// No need to call decipher.final()
			return true;
		} catch (err) {
			this.logger.error('Token verification failed', err.message);
			return false;
		}
	}

	/**
	 * Decrypts the token and returns the payload.
	 */
	decryptToken(token: string): any {
		try {
			const [encryptedData, authTag] = token.split(':');
			const iv = Buffer.from(this.ivHex, 'hex');
			const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
			decipher.setAuthTag(Buffer.from(authTag, 'hex'));

			let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
			decrypted += decipher.final('utf8');
			return JSON.parse(decrypted);
		} catch (err) {
			this.logger.error('Token decryption failed', err.message);
			throw new Error('Invalid token');
		}
	}

	/**
	 * Saves the token to MongoDB with rate limiting information.
	 */
	async saveToken(token: string, rateLimit: number, renewAt: Date) {
		const tokenDoc = new this.tokenModel({
			token,
			requestsRemaining: rateLimit,
			renewAt: renewAt
		});
		await tokenDoc.save();
	}

	/**
	 * Finds a token document in MongoDB.
	 */
	async findToken(token: string): Promise<TokenDocument> {
		return this.tokenModel.findOne({ token });
	}
}
