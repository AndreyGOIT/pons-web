//middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../models/User';
import { UserRole } from '../models/User';

const userRepo = AppDataSource.getRepository(User);

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret';

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    console.log('decoded token:', decoded);

    const user = await userRepo.findOneBy({ id: decoded.id });
    console.log('user found:', user);

    if (!user || !Object.values(UserRole).includes(user.role)) {
      res.status(401).json({ message: 'User not found or has invalid role' });
      return;
    }

    // Используем уже тип User из index.d.ts
    req.user = user;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err });
    return;
  }
};