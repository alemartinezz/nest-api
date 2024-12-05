import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../dtos/roles.guards.dto';
export const ROLES_KEY = 'roles';
export const Roles = (...roles) => SetMetadata(ROLES_KEY, roles);
export const SuperRole = () => Roles(UserRole.SUPER);
export const AdminRole = () => Roles(UserRole.ADMIN);
export const BasicRole = () => Roles(UserRole.BASIC);
//# sourceMappingURL=roles.decorator.js.map