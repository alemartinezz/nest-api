// .//src/auth/auth.controller.ts

import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	/**
	 * Endpoint to generate a new token.
	 */
	@Public()
	@Post('generate-token')
	async generateToken(@Body() body: any, @Res() res: Response) {
		// Validate the body as needed
		const payload = body.payload || {};
		const token = this.authService.generateToken(payload);

		// Store the token in MongoDB with rate limiting info
		const rateLimit = 1000; // Example rate limit
		const renewTime = new Date();
		renewTime.setHours(renewTime.getHours() + 1); // Renew in 1 hour
		await this.authService.saveToken(token, rateLimit, renewTime);

		res.json({ token });
	}
}
