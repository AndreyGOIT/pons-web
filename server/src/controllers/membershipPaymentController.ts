// server/src/controllers/membershipPaymentController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { MembershipPayment } from '../models/MembershipPayment';
import { MembershipStatus } from '../models/MembershipPayment';
import { User } from '../models/User';

// ===== USER CONTROLLERS =====

export const getUserPayments = async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const repo = AppDataSource.getRepository(MembershipPayment);
    const payments = await repo.find({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' }
    });

    res.json(payments);
};

export const markUserPaymentPending = async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const repo = AppDataSource.getRepository(MembershipPayment);

    const currentYear = new Date().getFullYear();

    // 1. Найти существующий платеж
    let payment = await repo.findOne({
        where: { userId, year: currentYear },
    });

// 2. Если есть → обновляем
    if (payment) {
        payment.status = MembershipStatus.PENDING;
        payment.userMarkedAt = new Date();
        await repo.save(payment);

        return res.json({ message: "Payment marked as pending", payment });
    }
    // 3. Если нет → создаём новую запись
     payment = repo.create({
         userId,
        year: currentYear,
        amount: 25, // или бери из env / конфигов
        status: MembershipStatus.PENDING,
        userMarkedAt: new Date(),
    });

    await repo.save(payment);

    res.json({ message: "Payment marked as pending", payment });
};


// ===== ADMIN CONTROLLERS =====

export const getAllPayments = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(MembershipPayment);

        const payments = await repo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' }
        });

        res.json(payments);
    } catch (error) {
        console.error("❌ getAllPayments error:", error);
        res.status(500).json({ error: "Failed to fetch membership payments" });
    }
};

export const confirmPayment = async (req: Request, res: Response) => {
    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ error: "paymentId is required" });
    }

    const repo = AppDataSource.getRepository(MembershipPayment);
    const payment = await repo.findOne({
        where: { id: paymentId },
        relations: ["user"], // если клиенту нужно знать пользователя
    });

    if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
    }

    // Set the status and confirmation data
    payment.status = MembershipStatus.PAID;
    payment.adminConfirmedAt = new Date();
    payment.adminId = req.user ? Number(req.user.id) : null; // authMiddleware должен задавать req.user

    const updated = await repo.save(payment);

    res.json({
        message: "Payment confirmed",
        payment: updated,
    });
};

export const createPaymentByAdmin = async (req: Request, res: Response) => {
    const { userId, status } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    const repo = AppDataSource.getRepository(MembershipPayment);

    const payment = repo.create({
        user: { id: userId },
        status: status || MembershipStatus.PENDING
    });

    await repo.save(payment);

    res.json({ message: "Payment created", payment });
};