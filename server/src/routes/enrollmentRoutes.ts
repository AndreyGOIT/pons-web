import { Router } from 'express';
import { enrollUser, updateInvoiceStatus } from '../controllers/enrollmentController';

const router = Router();

router.post('/', enrollUser as any);
router.patch('/:id/invoice', updateInvoiceStatus as any);

export default router;