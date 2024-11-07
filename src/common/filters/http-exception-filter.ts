// src/common/filters/http-exception.filter.ts

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest();

		let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
		let code = 'InternalServerError';
		let messages = ['An unexpected error occurred'];

		if (exception instanceof HttpException) {
			statusCode = exception.getStatus();
			const exceptionResponse = exception.getResponse();

			if (typeof exceptionResponse === 'string') {
				messages = [exceptionResponse];
			} else if (typeof exceptionResponse === 'object') {
				const res: any = exceptionResponse;
				messages = Array.isArray(res.message) ? res.message : [res.message];
				code = res.code || exception.name || 'HttpException';
			}
		}

		const errorResponse = {
			status: 'error',
			data: {
				data: null,
				errors: {
					code,
					messages
				}
			},
			metadata: null
		};

		response.status(statusCode).json(errorResponse);
	}
}
