// src/routes/userRoutes.ts
import { Router } from 'express';
import { registerUser, loginUser, getUsers,
    getUserById,
    updateUser,
    deleteUser,
} from '../controllers/userController';
    import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerUser as any);
router.post('/login', loginUser as any);
router.get('/', protect as any, getUsers);
router.get('/:id',protect as any,  getUserById as any);
router.put('/:id',protect as any,  updateUser as any);
router.delete('/:id',protect as any,  deleteUser as any);

export default router;
