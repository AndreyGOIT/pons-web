// server/src/controllers/adminController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import { Course } from '../models/Course';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateUsersPdf } from "../utils/pdf/generateUsersPdf";
import { validate } from 'class-validator';
import { CourseSession } from "../models/CourseSession";
import { Attendance } from "../models/Attendance";
import { Between } from "typeorm";

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

export const getUsers = async (req: Request, res: Response) => {
  try {
    // Получаем всех пользователей с ролью "user" (то есть клиентов)
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({
      where: { role: UserRole.CLIENT },
      order: { createdAt: "DESC" },
      relations: ["enrollments", "enrollments.course"],
    });

    // Форматируем данные при необходимости
    const formatted = users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      name: u.name,
      email: u.email,
      phoneNumber: u.phoneNumber,
      createdAt: u.createdAt,
      enrollments: u.enrollments?.map((e) => ({
        id: e.id,
        courseTitle: e.course?.title,
        invoicePaid: e.invoicePaid,
        paymentConfirmedByAdmin: e.paymentConfirmedByAdmin,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// download Users in PDF
export const getUsersPdf = async (req: Request, res: Response) => {
  const users = await AppDataSource.getRepository(User).find({
    order: { name: "ASC" },
    relations: ["enrollments", "enrollments.course"],
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

    const trainers = await userRepo.find({ where: { role: UserRole.TRAINER },
      relations: ["coursesAsTrainer"], // добавляем связь с курсами 
      order: { name: "ASC" } // сортируем по имени
    });

    const formatted = trainers.map((t) => ({
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      phoneNumber: t.phoneNumber,
      createdAt: t.createdAt ? t.createdAt.toISOString() : null,
      courses: t.coursesAsTrainer?.map((c) => ({ id: c.id, title: c.title })) || [],
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching trainers:", error);
    res.status(500).json({ message: "Server error while fetching trainers." });
  }
};
export const deleteTrainer = async (req: Request, res: Response) => {
  try {
    const trainerId = Number(req.params.id);
    const userRepo = AppDataSource.getRepository(User);
    const attendanceRepo = AppDataSource.getRepository(Attendance);

    const trainer = await userRepo.findOne({
      where: { id: trainerId, role: UserRole.TRAINER },
      relations: ["coursesAsTrainer"],
    });

    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    console.log(`🧹 Cleaning up relations for trainer ID: ${trainer.id}`);

    // 1️⃣ Убираем ссылки из таблицы курсов
    trainer.coursesAsTrainer = [];
    await userRepo.save(trainer);

    // 2️⃣ Обнуляем markedByUser в Attendance
    await attendanceRepo
      .createQueryBuilder()
      .update(Attendance)
      .set({ markedByUser: null as unknown as User  })
      .where("markedByUserId = :trainerId", { trainerId })
      .execute();

    // 3️⃣ Удаляем самого тренера
    await userRepo.remove(trainer);

    console.log(`✅ Trainer ID ${trainer.id} deleted successfully`);
    res.json({ message: "Trainer deleted successfully" });
  } catch (error) {
    console.error("Error deleting trainer:", error);
    res.status(500).json({ message: "Internal server error" });
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

// Unassign trainer from course (only ADMIN)
export const unassignTrainerFromCourse = async (req: Request, res: Response) => {
  try {
    const { trainerId, courseId } = req.params;

    const trainer = await userRepo.findOne({
      where: { id: Number(trainerId), role: UserRole.TRAINER },
      relations: ["coursesAsTrainer"],
    });

    if (!trainer) {
      res.status(404).json({ message: "Trainer not found" });
      return;
    }

    trainer.coursesAsTrainer = trainer.coursesAsTrainer.filter(
      (course) => course.id !== Number(courseId)
    );

    await userRepo.save(trainer);

    res.status(200).json({
      message: "Trainer successfully unassigned from course",
      trainerId,
      courseId,
    });
  } catch (error) {
    console.error("Error unassigning trainer:", error);
    res.status(500).json({ message: "Server error", error });
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


// Generate course sessions based on weekdays and time (only ADMIN)
// =============================================
// 📅 1. Генерация расписания тренировок курса
// =============================================
export const generateCourseSessions = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { weekdays, startTime, endTime } = req.body;

    const courseRepo = AppDataSource.getRepository(Course);
    const sessionRepo = AppDataSource.getRepository(CourseSession);

    const course = await courseRepo.findOne({ where: { id: Number(courseId) } });
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!Array.isArray(weekdays) || weekdays.length === 0) {
      return res.status(400).json({ message: "No weekdays provided" });
    }

    const start = new Date(course.startDate);
    const end = new Date(course.endDate);
    let count = 0;

    // Генерируем даты между startDate и endDate по выбранным дням недели
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const weekday = d.getDay() === 0 ? 7 : d.getDay(); // Sunday → 7
      if (weekdays.includes(weekday)) {
        const exists = await sessionRepo.exists({
          where: { course: { id: course.id }, date: d.toISOString().slice(0, 10) },
        });
        if (!exists) {
          const session = sessionRepo.create({
            course,
            date: d.toISOString().slice(0, 10),
            weekday,
          });
          await sessionRepo.save(session);
          count++;
        }
      }
    }

    res.json({ message: "Sessions generated", count });
  } catch (error) {
    console.error("Error generating sessions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =============================================
// 📋 2. Получение всех тренировок курса
// =============================================
export const getCourseSessions = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const sessionRepo = AppDataSource.getRepository(CourseSession);
    const sessions = await sessionRepo.find({
      where: { course: { id: Number(courseId) } },
      order: { date: "ASC" },
    });
    res.json(sessions);
  } catch (error) {
    console.error("Error fetching course sessions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =============================================
// 🗑️ 3. Удаление отдельной тренировки
// =============================================
export const deleteCourseSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const sessionRepo = AppDataSource.getRepository(CourseSession);

    const session = await sessionRepo.findOne({ where: { id: Number(sessionId) } });
    if (!session) return res.status(404).json({ message: "Session not found" });

    await sessionRepo.remove(session);
    res.json({ message: "Session deleted" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
