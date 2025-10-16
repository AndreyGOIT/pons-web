// src/routes/adminRoutes.ts
import { Router } from 'express';
import { getUsers, getUserById, updateCurrentUser, deleteUserByAdmin } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminOnly';
import { catchAsync } from '../utils/catchAsync';
import { getAdminProfile, updateAdminProfile, adminLogin, getUsersPdf } from '../controllers/adminController';
import { createTrainer, getTrainers, deleteTrainer, assignTrainerToCourse } from "../controllers/adminController";
import { createAdminUser } from "../controllers/adminController";

const router = Router();

// admin login
router.post('/login', adminLogin);

// all routes below require admin authentication
router.use(authMiddleware);
router.use(adminOnly);

// profile routes
router.get('/profile', catchAsync(getAdminProfile));
router.put('/profile', catchAsync(updateAdminProfile));

// PDF with users
router.get('/users/pdf', catchAsync(getUsersPdf));

// user management by admin
router.get('/users', catchAsync(getUsers));
router.get('/users/:id', catchAsync(getUserById));
router.put('/users/:id', catchAsync(updateCurrentUser));
router.delete('/users/:id', catchAsync(deleteUserByAdmin));

// trainer management by admin
// POST /api/admin/trainers — только админ может создавать тренера
router.post("/trainers", catchAsync(createTrainer));
// GET /api/admin/trainers
router.get("/trainers", catchAsync(getTrainers));
// PUT /api/admin/trainers/:id
// router.put("/trainers/:id", catchAsync(updateTrainer)); // можно добавить, если нужно обновление тренера
// DELETE /api/admin/trainers/:id
router.delete("/trainers/:id", catchAsync(deleteTrainer)); // можно добавить, если нужно удаление тренера

// assign trainer to course
// POST /api/admin/courses/:courseId/assign-trainer
router.post("/courses/:courseId/assign-trainer", catchAsync(assignTrainerToCourse));

// create an admin user (for initial setup)
// POST /api/admin/admins
router.post("/admins", catchAsync(createAdminUser));

export default router;