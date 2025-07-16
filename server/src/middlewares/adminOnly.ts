// middlewares/adminOnly.ts
import { Request, Response, NextFunction } from 'express';

export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  console.log('req.user в adminOnly:', req.user);
  if (!req.user || req.user.role !== 'admin') {
    console.warn('Access denied. User:', req.user);
    res.status(403).json({ message: 'Access denied' });
    return;
  }

  next();
};