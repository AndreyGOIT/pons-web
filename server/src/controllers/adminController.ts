// server/src/controllers/adminController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateUsersPdf } from "../utils/pdf/generateUsersPdf";

const userRepo = AppDataSource.getRepository(User);

export const adminLogin = async (req: Request, res: Response) => {
    try {
    const { email, password } = req.body;
    const admin = await userRepo.findOne({ where: { email, role: UserRole.ADMIN } });
    if (!admin) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }
    const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
          res.status(401).json({ message: 'Invalid credentials' });
          return;
        }
    console.log('проверка пароля admin, что он верный:', isValid);
    const token = jwt.sign({ id: admin.id, role: admin.role }, process.env.JWT_SECRET!, {
            expiresIn: '1h',
          });
    console.log('token при логине admin сгенерирован: ', token);
    
    // ✅ Ответ клиенту
      res.json({
        message: 'AdminLogin successful',
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
        token, // <-- добавляем токен
      });
    console.log('ответ клиенту с токеном:', { token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const getAdminProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id, name, email, role } = req.user;

  return res.json({
    id,
    name,
    email,
    role,
  });
};

export const updateAdminProfile = async (req: Request, res: Response) => {
      const user = req.user; // 👈 теперь TypeScript точно знает, что он определён
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const repo = AppDataSource.getRepository(User);
  const admin = await repo.findOneByOrFail({ id: user.id });

  const { name, email, phoneNumber } = req.body;
  admin.name = name || admin.name;
  admin.email = email || admin.email;
  admin.phoneNumber = phoneNumber || admin.phoneNumber;

  await repo.save(admin);

  res.json({ message: 'Данные обновлены', admin });
};

// download Users in PDF
export const getUsersPdf = async (req: Request, res: Response) => {
  const users = await AppDataSource.getRepository(User).find({
    order: { name: "ASC" },
  });

  generateUsersPdf(users, res);
};
