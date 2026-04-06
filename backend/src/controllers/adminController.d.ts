import type { Request, Response } from 'express';
export declare const getSystemStats: (req: Request, res: Response) => Promise<void>;
export declare const suspendUser: (req: Request, res: Response) => Promise<void>;
export declare const deleteInternshipListing: (req: Request, res: Response) => Promise<void>;
export declare const getPendingEmployers: (req: Request, res: Response) => Promise<void>;
export declare const getPendingApplicants: (req: Request, res: Response) => Promise<void>;
export declare const approveUser: (req: Request, res: Response) => Promise<void>;
export declare const rejectUser: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=adminController.d.ts.map