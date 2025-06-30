import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: UserRole;
  };
}

export const adminOnly = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'admin') {
        res.status(403).json({ message: 'Access denied: admins only' });
        return;
    }
    next();
  };