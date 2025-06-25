import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import { UserRole } from '../models/User'; 

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: UserRole;
      };
    }
  }
}

const userRepo = AppDataSource.getRepository(User);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
  
    const token = authHeader.split(' ')[1];
  
    try {
        const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      console.log('decoded token:', decoded);
      const user = await userRepo.findOneBy({ id: decoded.id });
      console.log('user found:', user);
      if (!user || !Object.values(UserRole).includes(user.role)) {
        return res.status(401).json({ message: 'User not found or has invalid role' });
      }
      console.log('typeof user.id:', typeof user.id); // <- это должен быть "number"
      req.user = {
        id: Number(user.id), // ← гарантируем числовой тип
        role: user.role,
      };
  
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token', error: err });
    }
  };