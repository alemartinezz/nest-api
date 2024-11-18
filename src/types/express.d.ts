// src/types/express.d.ts

import { UserDocument } from '../database/schemas/user.schema';
import { UserRole } from '../dto/user/roles.enum';

declare module 'express-serve-static-core' {
	interface Request {
		user?: UserDocument | { role: UserRole };
	}
}
