// src/notifications/mail/mail.service.ts

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

	async sendVerificationEmail(email: string, code: string): Promise<void> {
		const html = `
      <html>
      <body style="background-color: #f2f2f2; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px;">
          <h2>Email Verification</h2>
          <p>Your verification code is:</p>
          <p style="font-size: 24px; font-weight: bold;">${code}</p>
          <p>Please enter this code in the application to verify your email address.</p>
        </div>
      </body>
      </html>
    `;

		const mailOptions = {
			from: this.configService.get('EMAIL_FROM'),
			to: email,
			subject: 'Email Verification',
			html
		};

		try {
			await this.transporter.sendMail(mailOptions);
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
