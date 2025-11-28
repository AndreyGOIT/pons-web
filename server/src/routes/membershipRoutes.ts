import {Router} from "express";
import {authMiddleware} from "../middlewares/authMiddleware";
import {adminOnly} from "../middlewares/adminOnly";
import {
    getUserPayments,
    markUserPaymentPending,
    getAllPayments,
    confirmPayment,
    createPaymentByAdmin
} from '../controllers/membershipPaymentController';
import {catchAsync} from "../utils/catchAsync";

const router = Router();

// ========== USER ROUTES ==========
// Все требуют авторизацию
router.use('/user', authMiddleware);
// получить свои платежи
router.get('/user/payments', catchAsync(getUserPayments));
// пользователь отмечает, что он оплатил (pending)
router.post('/user/mark-paid', catchAsync(markUserPaymentPending));

// ========== ADMIN ROUTES ==========
// блок только для админа
router.use('/admin', authMiddleware, adminOnly);

//all payments of all users
router.get('/admin/all', catchAsync(getAllPayments));

//admin confirms the payments
router.post('/admin/confirm', catchAsync(confirmPayment));

// admin creates payment by hands
router.post('/admin/create', catchAsync(createPaymentByAdmin))

export default router;