import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import { Course } from '../models/Course';
import { generateCoursesPdf } from '../utils/pdf/generateCoursesReport';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET!, {
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

// скачать PDF с курсами
export const downloadCoursesPdf = async (req: Request, res: Response) => {
  const courseRepo = AppDataSource.getRepository(Course);
  const courses = await courseRepo.find();

  if (!courses.length) {
    return res.status(404).json({ message: 'Нет курсов для отчёта' });
  }

  generateCoursesPdf(courses, res); // PDF будет отправлен напрямую в res
};