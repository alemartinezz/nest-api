// src/auth/auth.service.ts

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

	generateToken(payload: any): string {
		const iv = Buffer.from(this.ivHex, 'hex');
		const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

		let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
		encrypted += cipher.final('hex');
		const authTag = cipher.getAuthTag().toString('hex');

		const token = `${encrypted}:${authTag}`;
		return token;
	}

	verifyToken(token: string): boolean {
		try {
			const [encryptedData, authTag] = token.split(':');
			const iv = Buffer.from(this.ivHex, 'hex');
			const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
			decipher.setAuthTag(Buffer.from(authTag, 'hex'));
			decipher.update(encryptedData, 'hex', 'utf8');
			return true;
		} catch (err) {
			this.logger.error('Token verification failed', err.message);
			return false;
		}
	}

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

	async saveToken(token: string, role: string, maxRequests: number, windowSizeInSeconds: number, renewAt: Date) {
		const tokenDoc = new this.tokenModel({
			token,
			role,
			requestsRemaining: maxRequests,
			maxRequests,
			windowSizeInSeconds,
			renewAt
		});
		await tokenDoc.save();
	}

	async findToken(token: string): Promise<TokenDocument> {
		return this.tokenModel.findOne({ token });
	}
}
