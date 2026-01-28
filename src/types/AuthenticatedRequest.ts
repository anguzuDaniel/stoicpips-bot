import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    subscription_status: string;
  };
}

export { AuthenticatedRequest };