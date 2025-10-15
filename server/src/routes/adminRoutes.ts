// src/routes/adminRoutes.ts
import { Router } from 'express';
import { getUsers, getUserById, updateCurrentUser, deleteUserByAdmin } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminOnly';
import { catchAsync } from '../utils/catchAsync';
import { getAdminProfile, updateAdminProfile, adminLogin, getUsersPdf } from '../controllers/adminController';
import { createTrainer, getTrainers, deleteTrainer } from "../controllers/adminController";
import { createAdminUser } from "../controllers/adminController";

const router = Router();

// Логин админа
router.post('/login', adminLogin);

// Все маршруты ниже требуют авторизацию админа
router.use(authMiddleware);
router.use(adminOnly);

// Профиль
router.get('/profile', catchAsync(getAdminProfile));
router.put('/profile', catchAsync(updateAdminProfile));

// PDF с пользователями
router.get('/users/pdf', catchAsync(getUsersPdf));

// Управление пользователями
router.get('/users', catchAsync(getUsers));
router.get('/users/:id', catchAsync(getUserById));
router.put('/users/:id', catchAsync(updateCurrentUser));
router.delete('/users/:id', catchAsync(deleteUserByAdmin));

// Управление тренерами
// POST /api/admin/trainers — только админ может создавать тренера
router.post("/trainers", catchAsync(createTrainer));
// GET /api/admin/trainers
router.get("/trainers", catchAsync(getTrainers));
// PUT /api/admin/trainers/:id
// router.put("/trainers/:id", catchAsync(updateTrainer)); // можно добавить, если нужно обновление тренера
// DELETE /api/admin/trainers/:id
router.delete("/trainers/:id", catchAsync(deleteTrainer)); // можно добавить, если нужно удаление тренера

// Создание админа (можно удалить после первого создания)
router.post("/admins", catchAsync(createAdminUser));

export default router;