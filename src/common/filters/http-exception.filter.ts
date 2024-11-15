// src/common/filters/http-exception.filter.ts

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ResponseFormat } from '../interceptors/transform-interceptor';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

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
				messages = Array.isArray(res.message) ? res.message : [res.message];
				code = res.code || exception.name || HttpStatus[statusCode] || 'HttpException';
			}
		}

		const metadata = response.getHeaders();
		if ('x-powered-by' in metadata) {
			delete metadata['x-powered-by'];
		}

		const statusText = HttpStatus[statusCode] || 'UnknownStatus';

		const errorResponse: ResponseFormat<any> = {
			status: statusText,
			code: statusCode,
			data: null,
			errors: messages ?? null,
			metadata
		};

		response.status(statusCode).json(errorResponse);
	}
}
