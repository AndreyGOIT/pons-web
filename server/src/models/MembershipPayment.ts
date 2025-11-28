import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

export enum MembershipStatus {
    UNPAID = "unpaid",   // только зарегистрирован, ещё не отметил оплату
    PENDING = "pending", // пользователь отметил оплату, ждёт подтверждения админа
    PAID = "paid",       // админ подтвердил оплату
}

@Entity()
@Index(["userId", "year"], { unique: true })
export class MembershipPayment {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user) => user.membershipPayments, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "userId" })
    user!: User;

    @Column()
    userId!: number;

    @Column({ type: "int" })
    year!: number;

    @Column({ type: "decimal", precision: 8, scale: 2, default: 25.0 })
    amount!: number;

    @Column({
        type: process.env.DB_TYPE === 'sqlite' ? 'text' : 'enum',
        enum: process.env.DB_TYPE === 'sqlite' ? undefined : MembershipStatus,
        default: MembershipStatus.UNPAID,
    })
    status!: MembershipStatus;

    @Column({ type: "datetime", nullable: true })
    userMarkedAt!: Date | null;

    @Column({ type: "datetime", nullable: true })
    adminConfirmedAt!: Date | null;

    @Column({ type: "int", nullable: true })
    adminId!: number | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}