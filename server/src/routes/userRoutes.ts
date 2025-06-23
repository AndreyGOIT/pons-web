// src/routes/userRoutes.ts
import { Router } from 'express';
import { registerUser, loginUser, getUsers,
    getUserById,
    updateUser,
    deleteUser, } from '../controllers/userController';

const router = Router();

router.post('/register', registerUser as any);
router.post('/login', loginUser as any);
router.get('/', getUsers);
router.get('/:id', getUserById as any);
router.put('/:id', updateUser as any);
router.delete('/:id', deleteUser as any);

export default router;
