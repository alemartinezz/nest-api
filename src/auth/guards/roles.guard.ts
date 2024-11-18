// src/auth/guards/roles.guard.ts

import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../dto/user/roles.enum';
import { IS_PUBLIC_KEY } from '../public.decorator'; // Import IS_PUBLIC_KEY
import { ROLES_KEY } from '../roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		// Check if endpoint is public
		const isPublic = this.reflector.get<boolean>(
			IS_PUBLIC_KEY,
			context.getHandler()
		);
		if (isPublic) {
			return true;
		}

		// Get the required roles from the route handler metadata
		const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);

		// If no roles are specified, deny access by default
		if (!requiredRoles || requiredRoles.length === 0) {
			throw new ForbiddenException(
				'Access denied: No roles assigned.'
			);
		}

		const request = context.switchToHttp().getRequest();
		const user = request.user;

		// Ensure user exists and has a role
		if (!user || !user.role) {
			throw new ForbiddenException(
				'Access denied: No user role found.'
			);
		}

		// user.role is now recognized by TypeScript
		if (requiredRoles.includes(user.role)) {
			return true;
		}

		// Deny access if roles do not match
		throw new ForbiddenException(
			`Access denied: Requires one of the following roles: ${requiredRoles.join(', ')}.`
		);
	}
}
