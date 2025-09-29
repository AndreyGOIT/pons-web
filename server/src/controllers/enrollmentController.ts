// src/controllers/enrollmentController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Enrollment } from "../models/Enrollment";
import { User } from "../models/User";
import { Course } from "../models/Course";

// Получение всех записей
const enrollmentRepo = AppDataSource.getRepository(Enrollment);
const userRepo = AppDataSource.getRepository(User);
const courseRepo = AppDataSource.getRepository(Course);

// POST /enrollments
export const enrollToCourse = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId } = req.body;

  if (!userId || !courseId) {
    res.status(400).json({ message: "userId and courseId are required" });
    return;
  }

  try {
    const user = await userRepo.findOneBy({ id: userId });
    const course = await courseRepo.findOneBy({ id: courseId });

    if (!user || !course) {
      res.status(404).json({ message: "User or course not found" });
      return;
    }

    const existing = await enrollmentRepo.findOne({
      where: { user: { id: user.id }, course: { id: course.id } },
    });

    if (existing) {
      res.status(400).json({ message: "Already enrolled to this course" });
      return;
    }

    const invoiceAmount = course.price;
    const paymentIban = "FI78 4055 0012 3222 24";
    const dateStr = new Date().toLocaleDateString("fi-FI");

    const referenceMap: Record<string, string> = {
      "KN - kuntonyrkkeily": "1025",
      "Nuoriso ryhmä": "1070",
    };

    const paymentReference = referenceMap[course.title] || `KURSSI-${course.title}-${user.name}-${dateStr}`;

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
      message: "Enrollment created",
      enrollment: {
        id: enrollment.id,
        courseTitle: course.title,
        invoiceAmount,
        paymentIban,
        paymentReference,
        invoiceDueDate: dueDate.toISOString().split("T")[0],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error enrolling", error: err });
  }
};

// GET /enrollments
export const getAllEnrollments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    console.log("Запрашиваю все регистрации...");
    const enrollments = await enrollmentRepo.find({
      relations: {
        user: true,
        course: true,
      },
    });
    console.log("Нашел регистрации:", enrollments.length);

    const result = enrollments
      .filter((e) => e.user && e.course) // ✅ пропускаем "битые" записи
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

    res.json(result);
  } catch (err) {
    console.error("Ошибка при получении регистраций:", err);
    res
      .status(500)
      .json({ message: "Error fetching all enrollments", error: err });
  }
};

// GET /enrollments/mine
export const getMyEnrollments = async (req: Request, res: Response): Promise<void> => {
  const userId = Number(req.query.userId);
  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid userId" });
    return;
  }

  if (req.user?.id !== userId && req.user?.role !== 'admin') {
    res.status(403).json({ message: "Forbidden: Cannot view another user's enrollments" });
    return;
  }

  try {
    const enrollments = await enrollmentRepo.find({ where: { user: { id: userId } }, relations: { course: true, user: true } });
    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching enrollments", error: err });
  }
};

// PATCH /enrollments/:id/mark-paid
export const markInvoiceAsPaid = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid enrollment id" });
    return;
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    const enrollment = await enrollmentRepo.findOne({ where: { id }, relations: { user: true } });
    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }

    if (enrollment.user.id !== userId && userRole !== 'admin') {
      res.status(403).json({ message: "Forbidden: Cannot mark another user's enrollment" });
      return;
    }

    enrollment.invoicePaid = true;
    enrollment.userPaymentMarkedAt = new Date();
    await enrollmentRepo.save(enrollment);

    res.json({ message: "Invoice marked as paid" });
  } catch (err) {
    res.status(500).json({ message: "Error marking payment", error: err });
  }
};

// PATCH /enrollments/:id/confirm
export const confirmPaymentByAdmin = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid enrollment id" });
    return;
  }

  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: "Forbidden: Only admin can confirm payments" });
    return;
  }

  try {
    const enrollment = await enrollmentRepo.findOne({ where: { id }, relations: { user: true, course: true } });
    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }

    enrollment.paymentConfirmedByAdmin = true;
    enrollment.adminConfirmedAt = new Date();
    await enrollmentRepo.save(enrollment);

    res.json({ message: "Payment confirmed by admin" });
  } catch (err) {
    res.status(500).json({ message: "Error confirming payment", error: err });
  }
};

// GET /enrollments/report?courseId=...
export const getEnrollmentReport = async (req: Request, res: Response): Promise<void> => {
  const courseId = Number(req.query.courseId);
  if (isNaN(courseId)) {
    res.status(400).json({ message: "Invalid courseId" });
    return;
  }

  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: "Forbidden: Only admin can view reports" });
    return;
  }

  try {
    const enrollments = await enrollmentRepo.find({ where: { course: { id: courseId } }, relations: { user: true, course: true } });
    const report = enrollments.map(e => ({
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
    res.status(500).json({ message: "Error generating report", error: err });
  }
};


// DELETE /enrollments/:id
export const deleteEnrollment = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ message: "Invalid enrollment id" });
    return;
  }

  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    const enrollment = await enrollmentRepo.findOne({ where: { id }, relations: { user: true } });
    if (!enrollment) {
      res.status(404).json({ message: "Enrollment not found" });
      return;
    }

    if (enrollment.user.id !== userId && userRole !== 'admin') {
      res.status(403).json({ message: "Forbidden: Cannot delete another user's enrollment" });
      return;
    }

    await enrollmentRepo.remove(enrollment);
    res.json({ message: "Enrollment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting enrollment", error: err });
  }
};