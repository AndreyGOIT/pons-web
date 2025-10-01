// src/routes/trainerRoutes.ts
import {Router} from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { trainerOnly } from "../middlewares/adminOnly";
import { catchAsync } from '../utils/catchAsync';
import { getTrainerCourses, getCourseAttendances, toggleAttendance } from "../controllers/trainerController";


const router = Router();

// Все маршруты ниже требуют авторизацию тренера
router.use(authMiddleware);
router.use(trainerOnly);

// GET /api/trainer/courses
router.get("/courses", catchAsync(getTrainerCourses));

// GET /api/trainer/courses/:courseId/attendances
router.get("/courses/:courseId/attendances", catchAsync(getCourseAttendances));

// POST /api/trainer/courses/:courseId/attendances/:sessionId/toggle
router.post("/courses/:courseId/attendances/:sessionId/toggle", catchAsync(toggleAttendance));

export default router;