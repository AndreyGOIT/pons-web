// server/src/controllers/adminController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { User, UserRole } from '../models/User';
import { Course } from '../models/Course';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateUsersPdf } from "../utils/pdf/generateUsersPdf";
import { catchAsync } from "../utils/catchAsync";
import { validate } from 'class-validator';
import { CourseSession } from "../models/CourseSession";
import { Attendance } from "../models/Attendance";
import { Between } from "typeorm";
import { AppError } from "../types/errors";

const userRepo = AppDataSource.getRepository(User);
const courseRepo = AppDataSource.getRepository(Course);

export const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await userRepo.findOne({ where: { email, role: UserRole.ADMIN } });
  if (!admin) {
    const error: AppError = new Error("Invalid credentials");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    const error: AppError = new Error("Invalid credentials");
    error.status = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const token = jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  res.json({
    message: "AdminLogin successful",
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    token,
  });
});

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

export const getUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userRepo.find({
    where: { role: UserRole.CLIENT },
    order: { createdAt: "DESC" },
    relations: ["enrollments", "enrollments.course"],
  });

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
});

// download Users in PDF
export const getUsersPdf = async (req: Request, res: Response) => {
  const users = await AppDataSource.getRepository(User).find({
    order: { name: "ASC" },
    relations: ["enrollments", "enrollments.course"],
  });

  generateUsersPdf(users, res);
};

// Create a new trainer (only ADMIN)
export const createTrainer = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  // Access control
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    const error: AppError = new Error("Access denied");
    error.status = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  // Check existing user
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    const error: AppError = new Error("Email already in use");
    error.status = 409;
    error.code = "EMAIL_EXISTS";
    throw error;
  }

  const user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  user.email = email;
  user.password = await bcrypt.hash(password, 10);
  user.phoneNumber = phoneNumber;
  user.role = UserRole.TRAINER;

  const errors = await validate(user);
  if (errors.length > 0) {
    const error: AppError = new Error("Validation failed");
    error.status = 400;
    error.code = "VALIDATION_ERROR";
    error.details = errors;
    throw error;
  }

  const savedTrainer = await userRepo.save(user);
  const { password: _, ...trainerWithoutPassword } = savedTrainer;

  res.status(201).json({
    message: "Trainer created successfully",
    trainer: trainerWithoutPassword,
  });
});

export const getTrainers = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    const error: AppError = new Error("Access denied: only admin can view trainers.");
    error.status = 403;
    error.code = "FORBIDDEN";
    throw error;
  }

  const trainers = await userRepo.find({
    where: { role: UserRole.TRAINER },
    relations: ["coursesAsTrainer"],
    order: { name: "ASC" }
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
});

export const deleteTrainer = catchAsync(async (req: Request, res: Response) => {
  const trainerId = Number(req.params.id);
  const attendanceRepo = AppDataSource.getRepository(Attendance);

  const trainer = await userRepo.findOne({
    where: { id: trainerId, role: UserRole.TRAINER },
    relations: ["coursesAsTrainer"],
  });

  if (!trainer) {
    const error: AppError = new Error("Trainer not found");
    error.status = 404;
    error.code = "TRAINER_NOT_FOUND";
    throw error;
  }

  // 1️⃣ Remove relations
  trainer.coursesAsTrainer = [];
  await userRepo.save(trainer);

  // 2️⃣ Clear attendance references
  await attendanceRepo
    .createQueryBuilder()
    .update(Attendance)
    .set({ markedByUser: null as unknown as User })
    .where("markedByUserId = :trainerId", { trainerId })
    .execute();

  // 3️⃣ Remove trainer
  await userRepo.remove(trainer);

  res.json({ message: "Trainer deleted successfully" });
});

// Assign trainer to course (only ADMIN)
export const assignTrainerToCourse = catchAsync(async (req: Request, res: Response) => {
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
    const error: AppError = new Error("Course or trainer not found");
    error.status = 404;
    error.code = "NOT_FOUND";
    throw error;
  }

  if (course.trainers?.some((t) => t.id === trainer.id)) {
    const error: AppError = new Error("Trainer already assigned to this course");
    error.status = 409;
    error.code = "ALREADY_ASSIGNED";
    throw error;
  }

  course.trainers = [...(course.trainers || []), trainer];
  await courseRepo.save(course);

  res.status(200).json({
    message: "Trainer successfully assigned to course",
    course,
  });
});

// Unassign trainer from course (only ADMIN)
export const unassignTrainerFromCourse = catchAsync(async (req: Request, res: Response) => {
  const { trainerId, courseId } = req.params;

  const trainer = await userRepo.findOne({
    where: { id: Number(trainerId), role: UserRole.TRAINER },
    relations: ["coursesAsTrainer"],
  });

  if (!trainer) {
    const error: AppError = new Error("Trainer not found");
    error.status = 404;
    error.code = "TRAINER_NOT_FOUND";
    throw error;
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
});

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
export const generateCourseSessions = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { weekdays } = req.body;

  const sessionRepo = AppDataSource.getRepository(CourseSession);

  const course = await courseRepo.findOne({ where: { id: Number(courseId) } });
  if (!course) {
    const error: AppError = new Error("Course not found");
    error.status = 404;
    error.code = "COURSE_NOT_FOUND";
    throw error;
  }

  if (!Array.isArray(weekdays) || weekdays.length === 0) {
    const error: AppError = new Error("No weekdays provided");
    error.status = 400;
    error.code = "INVALID_WEEKDAYS";
    throw error;
  }

  const start = new Date(course.startDate);
  const end = new Date(course.endDate);
  let count = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const weekday = d.getDay() === 0 ? 7 : d.getDay();

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
});

// =============================================
// 📋 2. Получение всех тренировок курса
// =============================================
export const getCourseSessions = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const sessionRepo = AppDataSource.getRepository(CourseSession);

  const sessions = await sessionRepo.find({
    where: { course: { id: Number(courseId) } },
    order: { date: "ASC" },
  });

  res.json(sessions);
});

// =============================================
// 🗑️ 3. Удаление отдельной тренировки
// =============================================
export const deleteCourseSession = catchAsync(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const sessionRepo = AppDataSource.getRepository(CourseSession);

  const session = await sessionRepo.findOne({ where: { id: Number(sessionId) } });

  if (!session) {
    const error: AppError = new Error("Session not found");
    error.status = 404;
    error.code = "SESSION_NOT_FOUND";
    throw error;
  }

  await sessionRepo.remove(session);

  res.json({ message: "Session deleted" });
});
