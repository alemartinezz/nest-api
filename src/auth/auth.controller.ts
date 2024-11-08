// src/auth/auth.controller.ts

import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('generate-token')
	async generateToken(@Body() body: any, retryCount = 0): Promise<{ token: string }> {
		try {
			const payload = body.payload || {};
			const role = body.role || 'user';

			let maxRequests: number;
			let windowSizeInSeconds: number;

			if (role === 'premium') {
				maxRequests = 10000;
				windowSizeInSeconds = 3600;
			} else if (role === 'basic') {
				maxRequests = 1000;
				windowSizeInSeconds = 3600;
			} else {
				maxRequests = 500; // Adjusted as per your current role
				windowSizeInSeconds = 3600;
			}

			const token = this.authService.generateToken(payload);

			const renewTime = new Date();
			renewTime.setSeconds(renewTime.getSeconds() + windowSizeInSeconds);

			if (retryCount > 5) {
				throw new HttpException('Unable to generate a unique token, please try again later.', HttpStatus.INTERNAL_SERVER_ERROR);
			}

			await this.authService.saveToken(token, role, maxRequests, windowSizeInSeconds, renewTime);
			return { token };
		} catch (error) {
			if ((error as any).code === 11000) {
				this.authService.logger.warn('Duplicate token generated, retrying...');
				return this.generateToken(body, retryCount + 1);
			}
			throw error;
		}
	}
}
