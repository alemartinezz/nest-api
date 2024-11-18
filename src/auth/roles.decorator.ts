// src/auth/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../dto/user/roles.enum';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const Super = () => Roles(UserRole.SUPER);
export const Admin = () => Roles(UserRole.ADMIN);
export const User = () => Roles(UserRole.USER);
export const Guest = () => Roles(UserRole.GUEST);
