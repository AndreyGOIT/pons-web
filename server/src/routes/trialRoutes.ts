// trialRoutes.ts
import { Router } from 'express';
import { createTrialBooking, getTrialBookings } from '../controllers/trialBookingController';

const router = Router();

router.post('/', createTrialBooking);
router.get('/', getTrialBookings);

export default router;


//POST /api/trial-bookings