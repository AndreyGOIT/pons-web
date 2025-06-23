// src/routes/userRoutes.ts
import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController';

const router = Router();

router.post('/register', registerUser as any);
router.post('/login', loginUser as any);

export default router;
