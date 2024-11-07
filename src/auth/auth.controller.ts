// src/auth/auth.controller.ts

import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('generate-token')
	async generateToken(@Body() body: any, @Res() res: Response) {
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
			maxRequests = 500;
			windowSizeInSeconds = 3600;
		}

		const token = this.authService.generateToken(payload);

		const renewTime = new Date();
		renewTime.setSeconds(renewTime.getSeconds() + windowSizeInSeconds);

		await this.authService.saveToken(token, role, maxRequests, windowSizeInSeconds, renewTime);

		res.json({ token });
	}
}
