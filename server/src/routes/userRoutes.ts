// src/routes/userRoutes.ts
import { Router } from 'express';
import { registerUser, loginUser, getUsers,
    getUserById,
    updateUser,
    deleteUser,
} from '../controllers/userController';
    import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerUser as any);
router.post('/login', loginUser as any);
router.get('/', authMiddleware as any, getUsers);
router.get('/:id', authMiddleware as any,  getUserById as any);
router.put('/:id', authMiddleware as any,  updateUser as any);
router.delete('/:id', authMiddleware as any, deleteUser as any);


export default router;
