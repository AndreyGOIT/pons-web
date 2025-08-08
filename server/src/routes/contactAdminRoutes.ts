// src/routes/contactAdminRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminOnly';
import { catchAsync } from '../utils/catchAsync';
import { getAllMessages, replyToMessage } from '../controllers/contactController';

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get('/', catchAsync(getAllMessages));
router.post('/:id/reply', catchAsync(replyToMessage));

export default router;