import { Router } from 'express';
import { getUsers, getUserById, updateCurrentUser, deleteCurrentUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminOnly';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.use(authMiddleware);     // все маршруты требуют авторизацию
router.use(adminOnly);          // и должны быть admin

router.get('/',catchAsync(getUsers));               // GET /api/admin/users
router.get('/:id', catchAsync(getUserById));         // GET /api/admin/users/:id
router.put('/:id', catchAsync(updateCurrentUser));          // PUT /api/admin/users/:id
router.delete('/:id', catchAsync(deleteCurrentUser));       // DELETE /api/admin/users/:id

export default router;