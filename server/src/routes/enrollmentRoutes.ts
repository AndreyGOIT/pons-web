// src/routes/enrollmentRoutes.ts
import { Router } from 'express';
import {
  enrollToCourse,
  getMyEnrollments,
  markInvoiceAsPaid,
  confirmPaymentByAdmin,
  getEnrollmentReport,
} from '../controllers/enrollmentController';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.post('/', catchAsync(enrollToCourse));
router.get('/mine', getMyEnrollments);
router.patch('/:id/mark-paid', catchAsync(markInvoiceAsPaid));
router.patch('/:id/confirm', catchAsync(confirmPaymentByAdmin));
router.get('/report', getEnrollmentReport);

export default router;