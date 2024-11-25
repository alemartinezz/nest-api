// src/modules/api/http-exception.filter.ts

import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger
} from '@nestjs/common';
import { ResponseFormat } from './response.format';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();
		let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		let code: string = 'InternalServerError';
		let messages: string[] = ['An unexpected error occurred'];
		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			const exceptionResponse = exception.getResponse();
			if (typeof exceptionResponse === 'string') {
				messages = [exceptionResponse];
			} else if (typeof exceptionResponse === 'object') {
				const res: any = exceptionResponse;
				messages = Array.isArray(res.message)
					? res.message
					: [res.message];
				code =
					res.code ||
					exception.name ||
					HttpStatus[statusCode] ||
					'HttpException';
			}
		} else {
			// Log unexpected errors
			this.logger.error('Unhandled exception', exception as any);
		}

		const statusText = HttpStatus[statusCode] || 'UnknownStatus';
		const errorResponse: ResponseFormat<any> = {
			status: statusText,
			code: statusCode,
			data: null,
			messages: messages ?? null
		};
		response.status(statusCode).json(errorResponse);
	}
}
