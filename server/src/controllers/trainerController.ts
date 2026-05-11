// src/controllers/trainerController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { Attendance } from "../models/Attendance";
import { CourseSession } from "../models/CourseSession";

import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

const userRepo = AppDataSource.getRepository(User);

export const trainerLogin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log('email, password из тела запроса при логине тренера: ', email, password);
  console.log('how role TRAINER looks like: ', UserRole.TRAINER);

  if (!email || !password) {
    throw new AppError('Email and password are required', 400, 'VALIDATION_ERROR');
  }

  const trainer = await userRepo.findOne({
    where: { email, role: UserRole.TRAINER },
  });

  console.log('Trainer из репо при логине: ', trainer);

  if (trainer) {
    console.log('Роль пользователя при логине тренера:', trainer.role);
  }

  if (!trainer) {
    throw new AppError('Trainer not found or role mismatch', 401, 'INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, trainer.password);

  console.log('password is correct?: ', isValid);

  if (!isValid) {
    throw new AppError('Invalid password', 401, 'INVALID_CREDENTIALS');
  }

  const token = jwt.sign(
    { id: trainer.id, role: trainer.role.toUpperCase() },
    process.env.JWT_SECRET!,
    {
      expiresIn: '1h',
    }
  );

  const { password: _, ...trainerWithoutPassword } = trainer;

  console.log('Token generated for trainer: ', token);

  res.json({
    success: true,
    message: 'Trainer login successful',
    user: trainerWithoutPassword,
    token,
  });
});

export const getTrainerProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const { id, firstName, lastName, name, email, role } = req.user;

  res.json({
    success: true,
    data: {
      id,
      firstName,
      lastName,
      name,
      email,
      role,
    },
  });
});

export const getTrainerCourses = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const trainer = req.user;
  const userRepo = AppDataSource.getRepository(User);

  const trainerData = await userRepo.findOne({
    where: { id: trainer.id },
    relations: ['coursesAsTrainer'],
  });

  if (!trainerData) {
    throw new AppError('Trainer not found', 404, 'TRAINER_NOT_FOUND');
  }

  res.json({
    success: true,
    data: trainerData.coursesAsTrainer,
  });
});

export const getCourseAttendances = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const trainer = req.user;
  const { courseId } = req.params;

  console.log('📘 Запрос посещаемости курса:', courseId);

  const courseRepo = AppDataSource.getRepository(Course);
  const course = await courseRepo.findOne({
    where: { id: Number(courseId) },
    relations: ['trainers', 'enrollments', 'enrollments.user'],
  });

  if (!course) {
    throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
  }

  const isTrainer = course.trainers.some((t) => t.id === trainer.id);

  if (!isTrainer && trainer.role !== UserRole.ADMIN) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const sessions = await AppDataSource.getRepository(CourseSession).find({
    where: { course: { id: Number(courseId) } },
    order: { date: 'ASC' },
  });

  const attendances = await AppDataSource.getRepository(Attendance).find({
    where: { enrollment: { course: { id: Number(courseId) } } },
    relations: ['enrollment', 'enrollment.user', 'session'],
  });

  console.log(`📊 Found ${attendances.length} attendance records for course ID ${courseId}`);

  res.json({
    success: true,
    data: {
      course,
      sessions,
      attendances,
    },
  });
});

export const toggleAttendance = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const user = req.user;

  const { courseId, sessionId } = req.params;
  const { userId, present } = req.body;

  const courseRepo = AppDataSource.getRepository(Course);
  const course = await courseRepo.findOne({
    where: { id: Number(courseId) },
    relations: ['trainers'],
  });

  if (!course) {
    throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND');
  }

  const isTrainer = course.trainers.some((t) => t.id === user.id);

  if (!(isTrainer || user.role === UserRole.ADMIN)) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const enrollmentRepo = AppDataSource.getRepository(Enrollment);
  const enrollment = await enrollmentRepo.findOne({
    where: { course: { id: Number(courseId) }, user: { id: Number(userId) } },
  });

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404, 'ENROLLMENT_NOT_FOUND');
  }

  const sessionRepo = AppDataSource.getRepository(CourseSession);
  const session = await sessionRepo.findOne({
    where: { id: Number(sessionId), course: { id: Number(courseId) } },
  });

  if (!session) {
    throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
  }

  const attendanceRepo = AppDataSource.getRepository(Attendance);

  let attendance = await attendanceRepo.findOne({
    where: { enrollment: { id: enrollment.id }, session: { id: session.id } },
    relations: ['enrollment', 'session'],
  });

  if (!attendance) {
    attendance = attendanceRepo.create({
      enrollment,
      session,
      present: !!present,
      markedAt: new Date(),
      markedByUser: user,
    });
  } else {
    attendance.present = !!present;
    attendance.markedAt = new Date();
    attendance.markedByUser = user;
  }

  await attendanceRepo.save(attendance);

  res.json({
    success: true,
    attendance,
  });
});

export const markAttendance = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
  }

  const user = req.user;
  const { enrollmentId, sessionId, present } = req.body;

  const enrollmentRepo = AppDataSource.getRepository(Enrollment);
  const enrollment = await enrollmentRepo.findOne({
    where: { id: enrollmentId },
    relations: ['course', 'user'],
  });

  if (!enrollment) {
    throw new AppError('Enrollment not found', 404, 'ENROLLMENT_NOT_FOUND');
  }

  const course = enrollment.course;
  const isTrainer = await isUserTrainerOfCourse(user.id, course.id);

  if (!(isTrainer || user.role === UserRole.ADMIN)) {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const sessionRepo = AppDataSource.getRepository(CourseSession);
  const session = await sessionRepo.findOne({
    where: { id: sessionId, course: { id: course.id } },
  });

  if (!session) {
    throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
  }

  const repo = AppDataSource.getRepository(Attendance);

  let att = await repo.findOne({
    where: { enrollment: { id: enrollment.id }, session: { id: session.id } },
    relations: ['enrollment', 'session'],
  });

  if (!att) {
    att = repo.create({
      enrollment,
      session,
      present: !!present,
      markedAt: new Date(),
      markedByUser: user,
    });
  } else {
    att.present = !!present;
    att.markedAt = new Date();
    att.markedByUser = user;
  }

  await repo.save(att);

  res.json({
    success: true,
    attendance: att,
  });
});

async function isUserTrainerOfCourse(userId: number, courseId: number): Promise<boolean> {
  const course = await AppDataSource.getRepository(Course).findOne({
    where: { id: courseId },
    relations: ["trainers"],
  });
  if (!course) return false;
  return course.trainers.some((t) => t.id === userId);
}