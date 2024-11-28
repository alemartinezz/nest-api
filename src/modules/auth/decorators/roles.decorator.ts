// src/modules/auth/decorators/roles.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../dtos/roles.guards.dto';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const SuperRole = () => Roles(UserRole.SUPER);

export const AdminRole = () => Roles(UserRole.ADMIN);

export const BasicRole = () => Roles(UserRole.BASIC);
