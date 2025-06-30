// src/routes/userRoutes.ts
import { Router } from 'express';
import { registerUser, loginUser, getCurrentUser, getUsers,
    getUserById,
    updateCurrentUser,
    deleteCurrentUser,
} from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerUser as any);
router.post('/login', loginUser as any);
router.get('/me', authMiddleware as any, getCurrentUser as any);
router.get('/', authMiddleware as any, getUsers);
router.get('/:id', authMiddleware as any,  getUserById as any);
router.put('/me', authMiddleware as any,  updateCurrentUser as any);
router.delete('/me', authMiddleware as any, deleteCurrentUser as any);


export default router;
