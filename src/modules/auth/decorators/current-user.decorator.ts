// src/modules/auth/decorators/current-user.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../mongoose/schemas/user.schema';

export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): UserDocument | undefined => {
		const request = ctx.switchToHttp().getRequest();

		return request.user as UserDocument | undefined;
	}
);
