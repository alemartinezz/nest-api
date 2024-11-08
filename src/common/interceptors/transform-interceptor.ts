// src/common/interceptors/transform.interceptor.ts

import { CallHandler, ExecutionContext, HttpStatus, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T> {
	status: string;
	code: number;
	data: T;
	errors: null | string[];
	metadata: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
		const ctx = context.switchToHttp();
		const response = ctx.getResponse();
		const statusCode: number = response.statusCode;
		const metadata = response.getHeaders();

		if ('x-powered-by' in metadata) {
			delete metadata['x-powered-by'];
		}

		const statusText = HttpStatus[statusCode] || 'UnknownStatus';

		return next.handle().pipe(
			map((data) => ({
				status: statusText,
				code: statusCode,
				data,
				errors: null,
				metadata
			}))
		);
	}
}
