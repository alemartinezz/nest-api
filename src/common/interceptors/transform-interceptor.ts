// src/common/interceptors/transform.interceptor.ts

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ResponseFormat<T> {
	status: string;
	data: {
		data: T;
		errors: {
			code: null | string;
			messages: null | string[];
		};
	};
	metadata: any;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
	intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
		const ctx = context.switchToHttp();
		const response = ctx.getResponse();
		const metadata = response.getHeaders();

		return next.handle().pipe(
			map((data) => ({
				status: 'success',
				code: response.statusCode,
				data: {
					data,
					errors: {
						code: null,
						messages: null
					}
				},
				metadata
			}))
		);
	}
}
