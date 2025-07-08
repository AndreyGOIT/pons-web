// src/routes/enrollmentRoutes.ts
import { Router } from 'express';
import {
  enrollToCourse,
  getMyEnrollments,
  markInvoiceAsPaid,
  confirmPaymentByAdmin,
  getEnrollmentReport,
  deleteEnrollment
} from '../controllers/enrollmentController';
import { catchAsync } from '../utils/catchAsync';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminOnly';


const router = Router();

router.post('/', authMiddleware,  catchAsync(enrollToCourse));
router.get('/mine', authMiddleware,  getMyEnrollments);
router.patch('/:id/mark-paid', authMiddleware, catchAsync(markInvoiceAsPaid));
router.patch('/:id/confirm', authMiddleware, adminOnly,  catchAsync(confirmPaymentByAdmin));
router.get('/report', authMiddleware, adminOnly,  getEnrollmentReport);
router.delete('/:id', authMiddleware,  catchAsync(deleteEnrollment));

export default router;