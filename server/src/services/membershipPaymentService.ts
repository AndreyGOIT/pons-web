import { AppDataSource } from "../data-source";
import { MembershipPayment, MembershipStatus } from "../models/MembershipPayment";

export const MembershipPaymentService = {
    repository: AppDataSource.getRepository(MembershipPayment),

    async createPayment(userId: number, year: number, amount = 25.0) {
        const payment = this.repository.create({
            userId,
            year,
            amount,
            status: MembershipStatus.UNPAID,
        });
        return this.repository.save(payment);
    },

    async markPending(userId: number, year: number) {
        const payment = await this.repository.findOneBy({ userId, year });
        if (!payment) throw new Error("Payment not found");
        payment.status = MembershipStatus.PENDING;
        payment.userMarkedAt = new Date();
        return this.repository.save(payment);
    },

    async confirmPayment(adminId: number, userId: number, year: number) {
        const payment = await this.repository.findOneBy({ userId, year });
        if (!payment) throw new Error("Payment not found");
        payment.status = MembershipStatus.PAID;
        payment.adminConfirmedAt = new Date();
        payment.adminId = adminId;
        return this.repository.save(payment);
    },

    async getUserPayments(userId: number) {
        return this.repository.find({ where: { userId } });
    },

    async getPaymentByYear(userId: number, year: number) {
        return this.repository.findOneBy({ userId, year });
    }
};