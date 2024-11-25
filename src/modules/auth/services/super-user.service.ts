// src/modules/auth/services/super-user.service.ts

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2 from 'argon2';
import { Model } from 'mongoose';
import { UserRole } from 'src/modules/auth/dtos/roles.enum';
import {
	User,
	UserDocument
} from 'src/modules/mongoose/schemas/user.schema';
@Injectable()
export class SuperUserService implements OnModuleInit {
	private readonly logger = new Logger(SuperUserService.name);
	private readonly superToken: string;
	private readonly superEmail: string;
	private readonly superPassword: string;
	constructor(
		private readonly configService: ConfigService,
		@InjectModel(User.name) private userModel: Model<UserDocument>
	) {
		this.superToken = this.configService.get<string>('SUPER_TOKEN');
		this.superEmail = this.configService.get<string>('SUPER_EMAIL');
		this.superPassword =
			this.configService.get<string>('SUPER_PASSWORD');
	}
	async onModuleInit() {
		await this.ensureSuperUser();
	}
	private async ensureSuperUser() {
		try {
			const existingUser = await this.userModel
				.findOne({ email: this.superEmail })
				.exec();
			// Hash the super password
			const hashedPassword = await argon2.hash(this.superPassword, {
				type: argon2.argon2id,
				memoryCost: 2 ** 16, // 64 MB
				timeCost: 3,
				parallelism: 1
			});
			if (existingUser) {
				this.logger.log(
					`Super user with email ${this.superEmail} already exists.`
				);
				let updated = false;
				if (existingUser.token !== this.superToken) {
					existingUser.token = this.superToken;
					updated = true;
				}
				if (existingUser.role !== UserRole.SUPER) {
					existingUser.role = UserRole.SUPER;
					updated = true;
				}
				// Update password if it doesn't match
				const isPasswordValid = await argon2.verify(
					existingUser.password,
					this.superPassword
				);
				if (!isPasswordValid) {
					existingUser.password = hashedPassword;
					updated = true;
				}
				if (updated) {
					await existingUser.save();
					this.logger.log(`Super user updated.`);
				}
			} else {
				const superUser = new this.userModel({
					email: this.superEmail,
					emailVerified: true,
					password: hashedPassword,
					role: UserRole.SUPER,
					token: this.superToken,
					tokenTotalUsage: 0
				});
				await superUser.save();
				this.logger.log(
					`Super user created with email ${this.superEmail}`
				);
			}
		} catch (error) {
			this.logger.error('Error ensuring super user existence', error);
		}
	}
}
