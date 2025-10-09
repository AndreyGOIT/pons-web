// src/controllers/trainerController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User, UserRole } from "../models/User";
import { Course } from "../models/Course";
import { Enrollment } from "../models/Enrollment";
import { Attendance } from "../models/Attendance";
import { CourseSession } from "../models/CourseSession";

// GET /api/trainer/courses
export const getTrainerCourses = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const trainer = req.user;
    const userRepo = AppDataSource.getRepository(User);

    const trainerData = await userRepo.findOne({
      where: { id: trainer.id },
      relations: ["coursesAsTrainer"],
    });

    if (!trainerData) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    res.json(trainerData.coursesAsTrainer);
  } catch (error) {
    console.error("Error in getTrainerCourses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /api/trainer/courses/:courseId/attendances
export const getCourseAttendances = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const trainer = req.user;
    const { courseId } = req.params;

    const courseRepo = AppDataSource.getRepository(Course);
    const course = await courseRepo.findOne({
      where: { id: Number(courseId) },
      relations: ["trainers", "enrollments", "enrollments.user"],
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isTrainer = course.trainers.some((t) => t.id === trainer.id);
    if (!isTrainer && trainer.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Access denied" });
    }

    const sessions = await AppDataSource.getRepository(CourseSession).find({
      where: { course: { id: Number(courseId) } },
      order: { date: "ASC" },
    });

    const attendances = await AppDataSource.getRepository(Attendance).find({
      where: { enrollment: { course: { id: Number(courseId) } } },
      relations: ["enrollment", "enrollment.user", "session"],
    });

    res.json({ course, sessions, attendances });
  } catch (error) {
    console.error("Error in getCourseAttendances:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /api/trainer/courses/:courseId/attendances/:sessionId/toggle
export const toggleAttendance = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user;

    const { courseId, sessionId } = req.params;
    const { userId, present } = req.body;

    const courseRepo = AppDataSource.getRepository(Course);
    const course = await courseRepo.findOne({
      where: { id: Number(courseId) },
      relations: ["trainers"],
    });
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isTrainer = course.trainers.some((t) => t.id === user.id);
    if (!(isTrainer || user.role === UserRole.ADMIN)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const enrollmentRepo = AppDataSource.getRepository(Enrollment);
    const enrollment = await enrollmentRepo.findOne({
      where: { course: { id: Number(courseId) }, user: { id: Number(userId) } },
    });
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

    const sessionRepo = AppDataSource.getRepository(CourseSession);
    const session = await sessionRepo.findOne({
      where: { id: Number(sessionId), course: { id: Number(courseId) } },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const attendanceRepo = AppDataSource.getRepository(Attendance);
    let attendance = await attendanceRepo.findOne({
      where: { enrollment: { id: enrollment.id }, session: { id: session.id } },
      relations: ["enrollment", "session"],
    });

    if (!attendance) {
      attendance = attendanceRepo.create({
        enrollment,
        session,
        present: !!present,
        markedAt: new Date(),
        markedByUserId: user.id,
      });
    } else {
      attendance.present = !!present;
      attendance.markedAt = new Date();
      attendance.markedByUserId = user.id;
    }

    await attendanceRepo.save(attendance);
    res.json({ success: true, attendance });
  } catch (error) {
    console.error("Error in toggleAttendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export async function markAttendance(req: Request, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = req.user;
    const { enrollmentId, sessionId, present } = req.body;

    const enrollmentRepo = AppDataSource.getRepository(Enrollment);
    const enrollment = await enrollmentRepo.findOne({
      where: { id: enrollmentId },
      relations: ["course", "user"],
    });
    if (!enrollment) return res.status(404).send("Enrollment not found");

    const course = enrollment.course;
    const isTrainer = await isUserTrainerOfCourse(user.id, course.id);
    if (!(isTrainer || user.role === UserRole.ADMIN)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const sessionRepo = AppDataSource.getRepository(CourseSession);
    const session = await sessionRepo.findOne({
      where: { id: sessionId, course: { id: course.id } },
    });
    if (!session) return res.status(404).send("Session not found");

    const repo = AppDataSource.getRepository(Attendance);
    let att = await repo.findOne({
      where: { enrollment: { id: enrollment.id }, session: { id: session.id } },
      relations: ["enrollment", "session"],
    });

    if (!att) {
      att = repo.create({
        enrollment,
        session,
        present: !!present,
        markedAt: new Date(),
        markedByUserId: user.id,
      });
    } else {
      att.present = !!present;
      att.markedAt = new Date();
      att.markedByUserId = user.id;
    }

    await repo.save(att);
    return res.json({ success: true, attendance: att });
  } catch (error) {
    console.error("Error in markAttendance:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function isUserTrainerOfCourse(userId: number, courseId: number): Promise<boolean> {
  const course = await AppDataSource.getRepository(Course).findOne({
    where: { id: courseId },
    relations: ["trainers"],
  });
  if (!course) return false;
  return course.trainers.some((t) => t.id === userId);
}