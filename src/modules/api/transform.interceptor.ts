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
export interface ResponseFormat<T> {
	status: string;
	code: number;
	data: any;
	errors: null | string[];
	metadata: any;
}

@Injectable()
export class TransformInterceptor<T>
	implements NestInterceptor<T, ResponseFormat<T>>
{
	intercept(
		context: ExecutionContext,
		next: CallHandler
	): Observable<ResponseFormat<T>> {
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
				data: sanitizeObject(data),
				errors: null,
				metadata
			}))
		);
	}
}
function sanitizeObject(
	obj: Record<string, any>,
	keysToRemove: string[] = []
): Record<string, any> {
	// Always remove 'password' by adding it to keysToRemove
	const updatedKeysToRemove = [...keysToRemove, 'password'];

	return Object.keys(obj).reduce<Record<string, any>>((acc, key) => {
		// check if need to transform to .toObject()
		obj[key] = obj[key]?.toObject ? obj[key].toObject() : obj[key];

		// remove the key if the key starts with 'token' but not 'token' itself
		if (key.startsWith('token') && key !== 'token') {
			return acc;
		}

		if (key === '_id') {
			acc['id'] = obj[key]?.toString(); // Ensure the ID is a string
		} else if (
			!key.startsWith('_') &&
			!updatedKeysToRemove.includes(key)
		) {
			acc[key] = obj[key];
		}
		return acc;
	}, {});
}
