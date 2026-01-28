import type { Request, Response, NextFunction } from "express";
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requirePaidUser: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const requireAuthAndPayment: ((req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>)[];
//# sourceMappingURL=authMiddleware.d.ts.map