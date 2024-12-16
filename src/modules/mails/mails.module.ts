// src/modules/mails/mails.module.ts

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mails.service';

@Module({
	imports: [
		ConfigModule
	],
	providers: [
		MailService
	],
	exports: [
		MailService
	]
})
export class MailsModule {}
