// middlewares/adminOnly.ts
import { Request, Response, NextFunction } from 'express';

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  next();
};