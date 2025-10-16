// server/src/controllers/adminController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import { Course } from '../models/Course';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateUsersPdf } from "../utils/pdf/generateUsersPdf";
import { validate } from 'class-validator';


const userRepo = AppDataSource.getRepository(User);
const courseRepo = AppDataSource.getRepository(Course);


// admin login
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

// Get admin profile
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

// Update admin profile
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

// Create a new trainer (only ADMIN)
export const createTrainer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    // Проверка прав
    if (req.user?.role !== UserRole.ADMIN) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Проверка существующего пользователя
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.phoneNumber = phoneNumber;
    user.role = UserRole.TRAINER;

    const errors = await validate(user);
    if (errors.length > 0) {
      res.status(400).json(errors);
      return;
    }

    const savedTrainer = await userRepo.save(user);
    const { password: _, ...trainerWithoutPassword } = savedTrainer;

    res.status(201).json({
      message: "Trainer created successfully",
      trainer: trainerWithoutPassword,
    });
  } catch (err) {
    console.error("❌ Error creating trainer:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Get all trainers (only ADMIN)
export const getTrainers = async (req: Request, res: Response) => {
  try {
    // Проверяем, что запрос делает администратор
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied: only admin can view trainers." });
    }

    const trainers = await userRepo.find({ where: { role: UserRole.TRAINER } });

    res.json(trainers);
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json({ message: "Server error while fetching trainers." });
  }
};
export const deleteTrainer = async (req: Request, res: Response) => {
  try {
    // Проверяем, что запрос делает администратор
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied: only admin can delete trainers." });
    }

    const trainerId = parseInt(req.params.id, 10);
    if (isNaN(trainerId)) {
      return res.status(400).json({ message: "Invalid trainer ID." });
    }

    const trainer = await userRepo.findOne({ where: { id: trainerId, role: UserRole.TRAINER } });
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found." });
    }

    await userRepo.remove(trainer);

    res.json({ message: "Trainer deleted successfully." });
  } catch (error) {
    console.error("Error deleting trainer:", error);
    res.status(500).json({ message: "Server error while deleting trainer." });
  }
};

// Assign trainer to course (only ADMIN)
export const assignTrainerToCourse = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { trainerId } = req.body;

    const course = await courseRepo.findOne({
      where: { id: Number(courseId) },
      relations: ["trainers"],
    });
    const trainer = await userRepo.findOne({
      where: { id: Number(trainerId), role: UserRole.TRAINER },
    });

    if (!course || !trainer) {
      return res.status(404).json({ message: "Course or trainer not found" });
    }

    // Check if trainer is already assigned
    if (course.trainers?.some((t) => t.id === trainer.id)) {
      return res.status(409).json({ message: "Trainer already assigned to this course" });
    }

    course.trainers = [...(course.trainers || []), trainer];
    await courseRepo.save(course);

    res.status(200).json({
      message: "Trainer successfully assigned to course",
      course,
    });
  } catch (err) {
    console.error("Error assigning trainer:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};

// Create an admin user (for initial setup)
export const createAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Проверяем существование
    const existing = await userRepo.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
    user.email = email;
    user.password = await bcrypt.hash(password, 10);
    user.role = UserRole.ADMIN;

    const saved = await userRepo.save(user);
    const { password: _, ...userWithoutPassword } = saved;

    res.status(201).json({ message: "Admin user created", user: userWithoutPassword });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ message: "Server error", error: err });
  }
};