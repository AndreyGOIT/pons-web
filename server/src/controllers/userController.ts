import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import jwt from 'jsonwebtoken';

const userRepo = AppDataSource.getRepository(User);
//user registration
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Проверка на корректную роль
    if (!Object.values(UserRole).includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }

    const user = new User();
    user.name = name;
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.role = role;

    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).json(errors);
      return;
    }

    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const savedUser = await userRepo.save(user);

    // ✅ Генерация токена
    const token = jwt.sign({ id: savedUser.id, role: savedUser.role }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });
    console.log('✅ Токен при регистрации успешно сгенерирован:', token);
    const { password: _, ...userWithoutPassword } = savedUser;

    // ✅ Ответ с токеном и пользователем
    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};
//user login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    const user = await userRepo.findOne({ where: { email } });
    console.log('user в логине из репо юзеров:', user);
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    console.log('проверка пароля, что он верный:', isValid);

    // 🔐 Генерация токена с более строгой типизацией payload
    interface JwtPayload {
      id: number;
      role: UserRole;
      iat?: number;
      exp?: number;
    }

    const payload: JwtPayload = { id: user.id, role: user.role };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    console.log('token при логине сгенерирован: ', token);
    console.log('payload.role:', payload.role);

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
    console.log('ответ клиенту с токеном:', res.json);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  console.log('✅ getCurrentUser called with req.user:', req.user);

  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  const userId = Number((req.user as any)?.id); // или создать типизацию правильно
  console.log('req.user:', req.user);
  console.log('userId:', userId, typeof userId);

  if (typeof userId !== 'number') {
    res.status(400).json({ message: 'Invalid user context' });
    return;
  }

  try {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
    });
    console.log("user in getCurrentUser:", user);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    try {
      console.log('📤 Sending response with user data...');
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await userRepo.find();
      const withoutPasswords = users.map(({ password, ...rest }) => rest);
      res.json(withoutPasswords);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  };
  
  // Получить одного пользователя
  export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await userRepo.findOne({ where: { id: Number(req.params.id) } });
      if (!user) {
        res.status(404).json({ message: 'User not found' })
        return;
      }
  
      const { password, ...userData } = user;
      res.json(userData);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err });
    }
  };
  
  // Обновить пользователя
  export const updateCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const userId = Number((req.user as any)?.id);
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
  
    try {
      const user = await userRepo.findOne({ where: { id: userId } });
  
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      const { name, email, password } = req.body;
  
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) {
        // тут может быть хэширование, если используешь bcrypt
        user.password = password;
      }
  
      const updatedUser = await userRepo.save(user);
  
      res.json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } catch (err) {
      console.error("Update error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // Удалить пользователя
  export const deleteCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const userId = Number((req.user as any)?.id);
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
  
    try {
      const result = await userRepo.delete(userId);
  
      if (result.affected === 0) {
        res.status(404).json({ message: "User not found" });
        return;
      }
  
      res.status(204).send(); // No content
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  };

  // Админ удаляет пользователя
  export const deleteUserByAdmin = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (!id) {
    res.status(400).json({ message: "Missing user ID" });
    return;
  }

  try {
    const user = await userRepo.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await userRepo.remove(user);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};