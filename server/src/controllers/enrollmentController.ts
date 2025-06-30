// src/controllers/enrollmentController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Enrollment } from '../models/Enrollment';
import { User } from '../models/User';
import { Course } from '../models/Course';

const enrollmentRepo = AppDataSource.getRepository(Enrollment);
const userRepo = AppDataSource.getRepository(User);
const courseRepo = AppDataSource.getRepository(Course);

// POST /enrollments
export const enrollToCourse = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId } = req.body;

  try {
    const user = await userRepo.findOneBy({ id: userId });
    const course = await courseRepo.findOneBy({ id: courseId });

    if (!user || !course) {
      res.status(404).json({ message: 'User or course not found' });
      return;
    }

    const existing = await enrollmentRepo.findOne({ where: { user, course } });
    if (existing) {
      res.status(400).json({ message: 'Already enrolled to this course' });
      return;
    }

    const enrollment = enrollmentRepo.create({
      user,
      course,
      invoiceSent: true, // счет создается автоматически
    });

    await enrollmentRepo.save(enrollment);
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ message: 'Error enrolling', error: err });
  }
};

// GET /enrollments/mine
export const getMyEnrollments = async (req: Request, res: Response) => {
  const userId = Number(req.query.userId);

  try {
    const enrollments = await enrollmentRepo.find({
      where: { user: { id: userId } },
    });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching enrollments', error: err });
  }
};

// PATCH /enrollments/:id/mark-paid
export const markInvoiceAsPaid = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const enrollment = await enrollmentRepo.findOneBy({ id });

    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    enrollment.invoicePaid = true;
    enrollment.userPaymentMarkedAt = new Date();

    await enrollmentRepo.save(enrollment);
    res.json({ message: 'Invoice marked as paid' });
  } catch (err) {
    res.status(500).json({ message: 'Error marking payment', error: err });
  }
};

// PATCH /enrollments/:id/confirm
export const confirmPaymentByAdmin = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  try {
    const enrollment = await enrollmentRepo.findOneBy({ id });

    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    enrollment.paymentConfirmedByAdmin = true;
    enrollment.adminConfirmedAt = new Date();

    await enrollmentRepo.save(enrollment);
    res.json({ message: 'Payment confirmed by admin' });
  } catch (err) {
    res.status(500).json({ message: 'Error confirming payment', error: err });
  }
};

// GET /enrollments/report?courseId=...
export const getEnrollmentReport = async (req: Request, res: Response) => {
  const courseId = Number(req.query.courseId);

  try {
    const enrollments = await enrollmentRepo.find({
      where: { course: { id: courseId } },
    });

    const report = enrollments.map(e => ({
      // user: `${e.user.firstName} ${e.user.lastName}`,
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

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: 'Error generating report', error: err });
  }
};