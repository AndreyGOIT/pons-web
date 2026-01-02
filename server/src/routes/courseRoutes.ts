// src/routes/courseRoutes.ts
import { Router } from 'express';
import { createCourse, getAllCourses, updateCourse } from '../controllers/courseController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminOnly';

const router = Router();

// Админский (создание сезона)
router.post('/', authMiddleware, adminOnly, createCourse);

//PATCH /api/courses/:id
router.patch('/:id', authMiddleware, adminOnly, updateCourse);

// Публичный / пользовательский
router.get('/', getAllCourses);

export default router;