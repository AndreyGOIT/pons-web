// src/controllers/enrollmentController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Enrollment } from "../models/Enrollment";
import { User } from "../models/User";
import { Course } from "../models/Course";
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

// Получение всех записей
const enrollmentRepo = AppDataSource.getRepository(Enrollment);
const userRepo = AppDataSource.getRepository(User);
const courseRepo = AppDataSource.getRepository(Course);

// POST /enrollments
export const enrollToCourse = catchAsync(async (req: Request, res: Response) => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    throw new AppError('userId and courseId are required', 400, 'VALIDATION_ERROR');
  }

  const user = await userRepo.findOneBy({ id: userId });
  const course = await courseRepo.findOneBy({ id: courseId });

  if (!user || !course) {
    throw new AppError('User or course not found', 404, 'NOT_FOUND');
  }

  const existing = await enrollmentRepo.findOne({
    where: { user: { id: user.id }, course: { id: course.id } },
  });

  if (existing) {
    throw new AppError('Already enrolled to this course', 400, 'ALREADY_ENROLLED');
  }

  const invoiceAmount = course.price;
  const paymentIban = 'FI78 4055 0012 3222 24';
  const dateStr = new Date().toLocaleDateString('fi-FI');

  const referenceMap: Record<string, string> = {
    'KN - kuntonyrkkeily': '1025',
    'Nuoriso ryhmä': '1070',
  };

  const paymentReference =
    referenceMap[course.title] || `KURSSI-${course.title}-${user.name}-${dateStr}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const enrollment = enrollmentRepo.create({
    user: { id: user.id },
    course: { id: course.id },
    invoiceSent: true,
    invoiceSentDate: new Date(),
    invoiceAmount,
    paymentIban,
    paymentReference,
    invoiceDueDate: dueDate,
  });

  await enrollmentRepo.save(enrollment);

  res.status(201).json({
    success: true,
    data: {
      id: enrollment.id,
      courseTitle: course.title,
      invoiceAmount,
      paymentIban,
      paymentReference,
      invoiceDueDate: dueDate.toISOString().split('T')[0],
    },
  });
});

// GET /enrollments
export const getAllEnrollments = catchAsync(async (req: Request, res: Response) => {
  const enrollments = await enrollmentRepo.find({
    relations: { user: true, course: true },
  });

  const result = enrollments
    .filter((e) => e.user && e.course)
    .map((e) => ({
      id: e.id,
      user: {
        id: e.user.id,
        name: e.user.name,
        email: e.user.email,
      },
      course: {
        id: e.course.id,
        title: e.course.title,
      },
      invoiceSent: e.invoiceSent,
      invoicePaid: e.invoicePaid,
      paymentConfirmedByAdmin: e.paymentConfirmedByAdmin,
      invoiceSentDate: e.invoiceSentDate,
      invoiceAmount: e.invoiceAmount,
      paymentIban: e.paymentIban,
      paymentReference: e.paymentReference,
      invoiceDueDate: e.invoiceDueDate,
      userPaymentMarkedAt: e.userPaymentMarkedAt,
      adminConfirmedAt: e.adminConfirmedAt,
    }));

  res.json({ success: true, data: result });
});

// GET /enrollments/mine
export const getMyEnrollments = catchAsync(async (req: Request, res: Response) => {
  const userId = Number(req.query.userId);
  if (isNaN(userId)) {
    throw new AppError('Invalid userId', 400, 'INVALID_ID');
  }

  if (req.user?.id !== userId && req.user?.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const enrollments = await enrollmentRepo.find({
    where: { user: { id: userId } },
    relations: { course: true, user: true },
  });

  res.json({ success: true, data: enrollments });
});

// PATCH /enrollments/:id/mark-paid
export const markInvoiceAsPaid = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw new AppError('Invalid enrollment id', 400, 'INVALID_ID');
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;

  const enrollment = await enrollmentRepo.findOne({ where: { id }, relations: { user: true } });
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404, 'NOT_FOUND');
  }

  if (enrollment.user.id !== userId && userRole !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  enrollment.invoicePaid = true;
  enrollment.userPaymentMarkedAt = new Date();
  await enrollmentRepo.save(enrollment);

  res.json({ success: true, message: 'Invoice marked as paid' });
});

// PATCH /enrollments/:id/confirm
export const confirmPaymentByAdmin = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw new AppError('Invalid enrollment id', 400, 'INVALID_ID');
  }

  if (req.user?.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const enrollment = await enrollmentRepo.findOne({ where: { id }, relations: { user: true, course: true } });
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404, 'NOT_FOUND');
  }

  enrollment.paymentConfirmedByAdmin = true;
  enrollment.adminConfirmedAt = new Date();
  await enrollmentRepo.save(enrollment);

  res.json({ success: true, message: 'Payment confirmed by admin' });
});

// GET /enrollments/report?courseId=...
export const getEnrollmentReport = catchAsync(async (req: Request, res: Response) => {
  const courseId = Number(req.query.courseId);
  if (isNaN(courseId)) {
    throw new AppError('Invalid courseId', 400, 'INVALID_ID');
  }

  if (req.user?.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  const enrollments = await enrollmentRepo.find({
    where: { course: { id: courseId } },
    relations: { user: true, course: true },
  });

  const report = enrollments.map((e) => ({
    user: e.user.name,
    email: e.user.email,
    course: e.course.title,
    invoiceSent: e.invoiceSent,
    invoicePaid: e.invoicePaid,
    paymentConfirmed: e.paymentConfirmedByAdmin,
    invoiceSentDate: e.invoiceSentDate,
    userPaymentMarkedAt: e.userPaymentMarkedAt,
    adminConfirmedAt: e.adminConfirmedAt,
  }));

  res.json({ success: true, data: report });
});


// DELETE /enrollments/:id
export const deleteEnrollment = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw new AppError('Invalid enrollment id', 400, 'INVALID_ID');
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;

  const enrollment = await enrollmentRepo.findOne({ where: { id }, relations: { user: true } });
  if (!enrollment) {
    throw new AppError('Enrollment not found', 404, 'NOT_FOUND');
  }

  if (enrollment.user.id !== userId && userRole !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  await enrollmentRepo.remove(enrollment);

  res.json({ success: true, message: 'Enrollment deleted successfully' });
});