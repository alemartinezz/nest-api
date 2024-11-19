// src/types/express.d.ts

import { UserDocument } from '../database/mongoose/schemas/user.schema';

declare global {
	namespace Express {
		interface Request {
			user?: UserDocument;
		}
	}
}
