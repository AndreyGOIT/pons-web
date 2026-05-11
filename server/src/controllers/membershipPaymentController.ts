// server/src/controllers/membershipPaymentController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { MembershipPayment } from '../models/MembershipPayment';
import { MembershipStatus } from '../models/MembershipPayment';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

// ===== USER CONTROLLERS =====

export const getUserPayments = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const repo = AppDataSource.getRepository(MembershipPayment);
    const currentYear = new Date().getFullYear();

    let payment = await repo.findOne({
        where: { userId, year: currentYear },
    });

    if (!payment) {
        payment = repo.create({
            userId,
            year: currentYear,
            amount: 25,
            status: MembershipStatus.UNPAID,
        });

        try {
            await repo.save(payment);
        } catch (err: any) {
            if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'ER_DUP_ENTRY') {
                payment = await repo.findOne({
                    where: { userId, year: currentYear },
                });
            } else {
                throw err;
            }
        }
    }

    const payments = await repo.find({
        where: { userId },
        order: { year: 'DESC' },
    });

    if (payments.length === 0) {
        payments.push({
            id: 0,
            year: currentYear,
            status: MembershipStatus.UNPAID,
        } as any);
    }

    res.json({
        success: true,
        data: payments,
    });
});

export const markUserPaymentPending = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    const repo = AppDataSource.getRepository(MembershipPayment);
    const currentYear = new Date().getFullYear();

    let payment = await repo.findOne({
        where: { userId, year: currentYear },
    });

    if (payment) {
        payment.status = MembershipStatus.PENDING;
        payment.userMarkedAt = new Date();
        await repo.save(payment);

        return res.json({
            success: true,
            message: 'Payment marked as pending',
            payment,
        });
    }

    payment = repo.create({
        userId,
        year: currentYear,
        amount: 25,
        status: MembershipStatus.PENDING,
        userMarkedAt: new Date(),
    });

    await repo.save(payment);

    res.json({
        success: true,
        message: 'Payment marked as pending',
        payment,
    });
});


// ===== ADMIN CONTROLLERS =====

export const getAllPayments = catchAsync(async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(MembershipPayment);

    const payments = await repo.find({
        relations: ['user'],
        order: { createdAt: 'DESC' },
    });

    res.json({
        success: true,
        data: payments,
    });
});

export const confirmPayment = catchAsync(async (req: Request, res: Response) => {
    const { paymentId } = req.body;

    if (!paymentId) {
        throw new AppError('paymentId is required', 400, 'VALIDATION_ERROR');
    }

    const repo = AppDataSource.getRepository(MembershipPayment);

    const payment = await repo.findOne({
        where: { id: paymentId },
        relations: ['user'],
    });

    if (!payment) {
        throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
    }

    payment.status = MembershipStatus.PAID;
    payment.adminConfirmedAt = new Date();
    payment.adminId = req.user ? Number(req.user.id) : null;

    const updated = await repo.save(payment);

    res.json({
        success: true,
        message: 'Payment confirmed',
        payment: updated,
    });
});

export const createPaymentByAdmin = catchAsync(async (req: Request, res: Response) => {
    const { userId, status } = req.body;

    if (!userId) {
        throw new AppError('userId is required', 400, 'VALIDATION_ERROR');
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: Number(userId) });

    if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const repo = AppDataSource.getRepository(MembershipPayment);

    const payment = repo.create({
        user: { id: userId },
        status: status || MembershipStatus.PENDING,
    });

    await repo.save(payment);

    res.json({
        success: true,
        message: 'Payment created',
        payment,
    });
});