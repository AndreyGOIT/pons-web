// src/routes/trialBookingAdminRoutes.ts
import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminOnly';
import { catchAsync } from '../utils/catchAsync';
import { getTrialBookings, deleteTrialBookings } from '../controllers/trialBookingController';

const router = Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get('/', catchAsync(getTrialBookings));
router.delete('/:id', catchAsync(deleteTrialBookings));

export default router;