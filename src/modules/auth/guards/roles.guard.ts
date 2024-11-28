// src/modules/auth/guards/roles.guard.ts

import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/modules/auth/decorators/public.decorator';
import { ROLES_KEY } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from '../dtos/roles.guards.dto';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const isPublic = this.reflector.getAllAndOverride<boolean>(
			IS_PUBLIC_KEY,
			[context.getHandler(), context.getClass()]
		);

		if (isPublic) {
			return true;
		}

		const rolesArray = this.reflector.getAllAndMerge<UserRole[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);

		const requiredRoles = rolesArray ?? [];

		if (requiredRoles.length === 0) {
			throw new ForbiddenException(
				'Access denied: No roles assigned.'
			);
		}

		const request = context.switchToHttp().getRequest();

		const user = request.user;

		if (!user || !user.role) {
			throw new ForbiddenException(
				'Access denied: No user role found.'
			);
		}

		if (user.role === UserRole.SUPER) {
			return true;
		}

		if (requiredRoles.includes(user.role)) {
			return true;
		}

		throw new ForbiddenException(
			`Access denied: Requires one of the following roles: ${requiredRoles.join(
				', '
			)}.`
		);
	}
}
