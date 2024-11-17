import { UserDocument } from '../database/schemas/user.schema';

declare module 'express-serve-static-core' {
	interface Request {
		user?: UserDocument;
	}
}
