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

    const payment = repo.create({
        user: { id: userId },
        status: MembershipStatus.PENDING
    });

    await repo.save(payment);

    res.json({ message: "Payment marked as pending", payment });
};


// ===== ADMIN CONTROLLERS =====

export const getAllPayments = async (req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(MembershipPayment);

    const payments = await repo.find({
        relations: ['user'],
        order: { createdAt: 'DESC' }
    });

    res.json(payments);
};

export const confirmPayment = async (req: Request, res: Response) => {
    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ error: "paymentId is required" });
    }

    const repo = AppDataSource.getRepository(MembershipPayment);
    const payment = await repo.findOne({ where: { id: paymentId } });

    if (!payment) {
        return res.status(404).json({ error: "Payment not found" });
    }

    payment.status = MembershipStatus.PAID;
    await repo.save(payment);

    res.json({ message: "Payment confirmed", payment });
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