// scripts/createDefaultMemberships.ts

import { AppDataSource } from "../data-source";
import { User } from "../models/User";
import { MembershipPayment, MembershipStatus } from "../models/MembershipPayment";

async function run() {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const paymentRepo = AppDataSource.getRepository(MembershipPayment);

    const users = await userRepo.find({
        relations: ["membershipPayments"],
    });

    for (const user of users) {
        if (!user.membershipPayments || user.membershipPayments.length === 0) {
            const payment = paymentRepo.create({
                user,
                status: MembershipStatus.UNPAID,
                year: new Date().getFullYear(),
            });

            await paymentRepo.save(payment);
            console.log(`Created UNPAID membership for user ${user.email}`);
        }
    }

    console.log("All done!");
    process.exit(0);
}

run().catch((err) => {
    console.error(err);
    process.exit(1);
});