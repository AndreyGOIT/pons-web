import { Router } from 'express';
import { enrollUser, updateInvoiceStatus } from '../controllers/enrollmentController';
import { requireRole } from '../middlewares/roleMiddleware';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', enrollUser as any);
router.patch('/:id/invoice',
    authMiddleware as any,
    requireRole(['admin', 'trainer']) as any,  // Только админ и тренер могут обновлять статус оплаты
    updateInvoiceStatus as any);

export default router;