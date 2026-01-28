import type { Request, Response } from "express";
export declare const loginUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const signupUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.controller.d.ts.map