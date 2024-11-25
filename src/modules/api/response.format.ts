// src/modules/api/response.format.ts

export interface ResponseFormat<T> {
	status: string;
	code: number;
	data: any;
	messages: null | string[];
}
