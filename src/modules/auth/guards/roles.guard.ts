// /src/modules/auth/guards/roles.guard.ts

import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/modules/auth/decorators/public.decorator';
import { ROLES_KEY } from 'src/modules/auth/decorators/roles.decorator';
import { UserRole } from '../dtos/roles.enum';
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
		const rolesArray = this.reflector.getAllAndMerge<UserRole[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		);
		const requiredRoles = rolesArray ?? [];
		// If no roles are specified, deny access by default
		if (requiredRoles.length === 0) {
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
		// Allow access if user is 'super'
		if (user.role === UserRole.SUPER) {
			return true;
		}
		// Check if user's role is in required roles
		if (requiredRoles.includes(user.role)) {
			return true;
		}
		// Deny access if roles do not match
		throw new ForbiddenException(
			`Access denied: Requires one of the following roles: ${requiredRoles.join(
				', '
			)}.`
		);
	}
}
