// src/features/notifications/notifications.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/modules/mails/mails.service';

@Injectable()
export class MyNotificationsService {
	private readonly logger = new Logger(MyNotificationsService.name);

	constructor(private readonly mailService: MailService) {}

	/**
	 * Sends a verification email to the specified user with the provided code.
	 * @param email - The recipient's email address.
	 * @param code - The verification code to include in the email.
	 */
	async sendVerificationEmail(email: string, code: string): Promise<void> {
		try {
			// Load and process the HTML template with the verification code
			const html = await this.mailService.loadTemplate(
				'verification-email',
				{
					code
				}
			);
			// Send the email using the MailService
			await this.mailService.sendEmail(
				email,
				'Verification Email',
				html
			);
			this.logger.log(`Verification email sent to ${email}`);
		} catch (error) {
			this.logger.error(
				`Failed to send verification email to ${email}`,
				error
			);
			throw error;
		}
	}
}
