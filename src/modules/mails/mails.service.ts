// src/modules/mails/mails.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

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
