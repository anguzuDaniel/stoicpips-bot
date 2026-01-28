import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    subscription_status: string;
    isAdmin?: boolean;
  };
}

export { AuthenticatedRequest };