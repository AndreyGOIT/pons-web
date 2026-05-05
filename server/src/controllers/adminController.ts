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
import { AppError } from "../utils/AppError";

const userRepo = AppDataSource.getRepository(User);
const courseRepo = AppDataSource.getRepository(Course);

export const adminLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await userRepo.findOne({ where: { email, role: UserRole.ADMIN } });
  if (!admin) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
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
export const getAdminProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const { id, name, email, role } = req.user;

  res.json({
    id,
    name,
    email,
    role,
  });
});

// Update admin profile
export const updateAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const repo = AppDataSource.getRepository(User);
  const admin = await repo.findOneByOrFail({ id: user.id });

  const { name, email, phoneNumber } = req.body;
  admin.name = name || admin.name;
  admin.email = email || admin.email;
  admin.phoneNumber = phoneNumber || admin.phoneNumber;

  await repo.save(admin);

  res.json({ message: "Данные обновлены", admin });
});

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
export const getUsersPdf = catchAsync(async (req: Request, res: Response) => {
  const users = await AppDataSource.getRepository(User).find({
    order: { name: "ASC" },
    relations: ["enrollments", "enrollments.course"],
  });

  generateUsersPdf(users, res);
});

// Create a new trainer (only ADMIN) use AppError!
export const createTrainer = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password, phoneNumber } = req.body;

  // Access control
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new AppError("Access denied", 403, "FORBIDDEN");
  }

  // Check existing user
  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    throw new AppError("Email already in use", 409, "EMAIL_EXISTS");
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
    throw new AppError("Validation failed", 400, "VALIDATION_ERROR");
  }

  const savedTrainer = await userRepo.save(user);
  const { password: _, ...trainerWithoutPassword } = savedTrainer;

  res.status(201).json({
    message: "Trainer created successfully",
    trainer: trainerWithoutPassword,
  });
});
// with new AppError!
export const getTrainers = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new AppError("Access denied: only admin can view trainers.", 403, "FORBIDDEN");
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
    throw new AppError("Trainer not found", 404, "TRAINER_NOT_FOUND");
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
    throw new AppError("Course or trainer not found", 404, "NOT_FOUND");
  }

  if (course.trainers?.some((t) => t.id === trainer.id)) {
    throw new AppError("Trainer already assigned to this course", 409, "ALREADY_ASSIGNED");
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
    throw new AppError("Trainer not found", 404, "TRAINER_NOT_FOUND");
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
export const createAdminUser = catchAsync(async (req: Request, res: Response) => {
  const { firstName, lastName, email, password } = req.body;

  const existing = await userRepo.findOne({ where: { email } });
  if (existing) {
    throw new AppError("Email already in use", 409, "EMAIL_EXISTS");
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
});


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
    throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
  }

  if (!Array.isArray(weekdays) || weekdays.length === 0) {
    throw new AppError("No weekdays provided", 400, "INVALID_WEEKDAYS");
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
    throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
  }

  await sessionRepo.remove(session);

  res.json({ message: "Session deleted" });
});
