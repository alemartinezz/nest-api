// src/modules/api/transform.interceptor.ts
import {
	CallHandler,
	ExecutionContext,
	HttpStatus,
	Injectable,
	NestInterceptor
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseFormat } from './response.format';

@Injectable()
export class TransformInterceptor<T>
	implements NestInterceptor<T, ResponseFormat<T>> {
	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<ResponseFormat<T>> {
		return next.handle().pipe(
			map((data) => {
				const ctx = context.switchToHttp();
				const response = ctx.getResponse();
				const statusCode: number = response.statusCode;
				const statusText = HttpStatus[statusCode] || 'UnknownStatus';
				// Extract messages from data
				const messages = data.messages ?? null;

				// Remove messages from data
				const { messages: _, ...dataWithoutMessages } = data;

				return {
					status: statusText,
					code: statusCode,
					data: dataWithoutMessages,
					messages
				};
			})
		);
	}
}
