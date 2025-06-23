import { Router } from 'express';
import { enrollUser, markAsPaid } from '../controllers/enrollmentController';

const router = Router();

router.post('/', enrollUser as any);
router.patch('/:id/pay', markAsPaid as any);

export default router;