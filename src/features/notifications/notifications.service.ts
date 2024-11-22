// src/features/notifications/notifications.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { MailService } from 'src/modules/mails/mails.service';

@Injectable()
export class MyNotificationsService {
	private readonly logger = new Logger(MyNotificationsService.name);

	constructor(private readonly mailService: MailService) {}

	/**
	 * Loads an HTML template and replaces placeholders with provided variables.
	 * @param templateName - The name of the template file (without extension).
	 * @param variables - A record of variables to replace in the template.
	 * @returns The processed HTML string.
	 */
	async loadTemplate(
		templateName: string,
		variables: Record<string, string>
	): Promise<string> {
		const templatePath = path.join(
			__dirname,
			'..',
			'templates',
			`${templateName}.html`
		);
		try {
			let template = await fs.readFile(templatePath, 'utf-8');
			for (const [key, value] of Object.entries(variables)) {
				const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
				template = template.replace(regex, value);
			}
			return template;
		} catch (error) {
			throw new Error(
				`Failed to load template "${templateName}": ${error.message}`
			);
		}
	}

	/**
	 * Sends a verification email to the specified user with the provided code.
	 * @param email - The recipient's email address.
	 * @param code - The verification code to include in the email.
	 */
	async sendVerificationEmail(email: string, code: string): Promise<void> {
		try {
			// Load and process the HTML template with the verification code
			const html = await this.loadTemplate('verification-email', {
				code
			});

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
