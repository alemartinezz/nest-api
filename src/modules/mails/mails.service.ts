// src/modules/mails/mails.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name);
	private transporter: nodemailer.Transporter;

	constructor(private readonly configService: ConfigService) {
		// Configure the transporter with Gmail SMTP settings
		this.transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: this.configService.get<string>('EMAIL_USER'),
				pass: this.configService.get<string>('EMAIL_PASSWORD')
			}
		});
	}

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
		try {
			const templatePath = path.join(
				__dirname,
				'..',
				'..',
				'data',
				'templates',
				`${templateName}.html`
			);

			// Check if the file exists asynchronously
			try {
				await fs.access(templatePath);
			} catch {
				console.error(
					'Template file does not exist at:',
					templatePath
				);

				throw new Error('Template file does not exist.');
			}

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
	 * Sends an email with the provided HTML content.
	 * @param email - The recipient's email address.
	 * @param html - The HTML content of the email.
	 */
	async sendEmail(
		email: string,
		subject: string,
		html: string
	): Promise<void> {
		const mailOptions = {
			from: this.configService.get<string>('EMAIL_FROM'),
			to: email,
			subject,
			html
		};

		try {
			await this.transporter.sendMail(mailOptions);

			this.logger.log(`${subject} email sent to ${email}`);
		} catch (error) {
			this.logger.error(
				`Failed to send ${subject} email to ${email}`,
				error
			);

			throw error;
		}
	}
}
