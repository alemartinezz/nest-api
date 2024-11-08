import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { Token, TokenDocument } from './token.schema';

@Injectable()
export class AuthService {
	readonly logger = new Logger(AuthService.name);
	private readonly encryptionKey: Buffer;

	constructor(
		private readonly configService: ConfigService,
		@InjectModel(Token.name) private tokenModel: Model<TokenDocument>
	) {
		this.encryptionKey = Buffer.from(this.configService.get<string>('ENCRYPTION_KEY'), 'utf8');
	}

	generateToken(payload: any): string {
		// Generate a random IV for each token
		const iv = crypto.randomBytes(12); // 12 bytes for GCM
		const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);

		let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
		encrypted += cipher.final('hex');
		const authTag = cipher.getAuthTag().toString('hex');

		// Include the IV in the token
		const token = `${iv.toString('hex')}:${encrypted}:${authTag}`;
		return token;
	}

	verifyToken(token: string): boolean {
		try {
			const [ivHex, encryptedData, authTag] = token.split(':');
			if (!ivHex || !encryptedData || !authTag) {
				throw new Error('Invalid token format');
			}
			const iv = Buffer.from(ivHex, 'hex');
			const decipher = crypto.createDecipheriv('aes-256-gcm', this.encryptionKey, iv);
			decipher.setAuthTag(Buffer.from(authTag, 'hex'));
			decipher.update(encryptedData, 'hex', 'utf8');
			decipher.final('utf8');
			return true;
		} catch (err) {
			this.logger.error('Token verification failed', err.message);
			return false;
		}
	}

	decryptToken(token: string): any {
		try {
			const [ivHex, encryptedData, authTag] = token.split(':');
			if (!ivHex || !encryptedData || !authTag) {
				throw new Error('Invalid token format');
			}
			const iv = Buffer.from(ivHex, 'hex');
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
