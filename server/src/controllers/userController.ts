// server/src/controllers/userController.ts

import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: UserRole;
  };
}

const userRepo = AppDataSource.getRepository(User);
//user registration
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Проверка на корректную роль
    if (!Object.values(UserRole).includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.role = role;

    const errors = await validate(user);
    if (errors.length > 0) {
      return res.status(400).json(errors);
    }

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const savedUser = await userRepo.save(user);
    const { password: _, ...userWithoutPassword } = savedUser;

    res.status(201).json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
//user login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    const user = await userRepo.findOne({ where: { email } });
    console.log('user в логине из репо юзеров:', user);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 🔐 Генерация токена
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });
  
      // ✅ Ответ клиенту
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token, // <-- добавляем токен
      });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  console.log('✅ getCurrentUser called with req.user:', req.user);

  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const userId = Number((req.user as any)?.id); // или создать типизацию правильно
  console.log('req.user:', req.user);
  console.log('userId:', userId, typeof userId);

  if (typeof userId !== 'number') {
    return res.status(400).json({ message: 'Invalid user context' });
  }

  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role'],
    });
console.log("user in getCurrentUser:", user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    try {
      console.log('📤 Sending response with user data...');
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
      console.log('✅ Response successfully sent');
    } catch (err) {
      console.error('❌ Failed to send response:', err);
      res.status(500).json({ message: 'Server error while sending response' });
    }
  } catch (err) {
    console.error('getCurrentUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Получить всех пользователей
export const getUsers = async (req: Request, res: Response) => {
    try {
      const users = await userRepo.find();
      const withoutPasswords = users.map(({ password, ...rest }) => rest);
      res.json(withoutPasswords);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  };
  
  // Получить одного пользователя
  export const getUserById = async (req: Request, res: Response) => {
    try {
      const user = await userRepo.findOne({ where: { id: Number(req.params.id) } });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const { password, ...userData } = user;
      res.json(userData);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  };
  
  // Обновить пользователя
  export const updateUser = async (req: Request, res: Response) => {
    try {
      const user = await userRepo.findOne({ where: { id: Number(req.params.id) } });
      if (!user) return res.status(404).json({ message: 'User not found' });
  
      const { name, email, password } = req.body;
  
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password = await bcrypt.hash(password, 10);
  
      const errors = await validate(user);
      if (errors.length > 0) {
        return res.status(400).json(errors);
      }
  
      const updated = await userRepo.save(user);
      const { password: _, ...updatedWithoutPassword } = updated;
      res.json(updatedWithoutPassword);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  };
  
  // Удалить пользователя
  export const deleteUser = async (req: Request, res: Response) => {
    try {
      const result = await userRepo.delete(Number(req.params.id));
      if (result.affected === 0) return res.status(404).json({ message: 'User not found' });
  
      res.status(204).send(); // No content
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  };