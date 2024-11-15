//src/auth/auth.controller.ts

import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('generate-token')
	async generateToken(@Body() body: { email: string }): Promise<{ clientId: string; token: string }> {
		const { email } = body;

		if (!email) {
			throw new HttpException('Email is required', HttpStatus.BAD_REQUEST);
		}

		// Step 1: Create a user with UUIDv4 clientId
		const clientId = this.authService.generateClientId();

		// Step 2: Generate a token without including client data
		const token = this.authService.generateToken();

		// Step 3: Associate clientId, token, and email in the database
		await this.authService.createUser(clientId, token, email);

		return { clientId, token };
	}
}
