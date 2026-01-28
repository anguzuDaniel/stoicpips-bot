import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: User; // Make user optional to match Express's Request type
    }
  }
}

// export interface AuthenticatedRequest extends Request {
//   user: User; // For routes where user is guaranteed to exist
// }