// src/routes/adminRoutes.ts
import { Router } from 'express';
import { getUsers, getUserById, updateCurrentUser, deleteUserByAdmin } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminOnly';
import { catchAsync } from '../utils/catchAsync';
import { getAdminProfile, updateAdminProfile, adminLogin, getUsersPdf } from '../controllers/adminController';

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

export default router;