import type { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../AuthenticatedRequest";
export declare const requireAuth: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requirePaidUser: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requireAuthAndPayment: ((req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>)[];
//# sourceMappingURL=authMiddleware.d.ts.map