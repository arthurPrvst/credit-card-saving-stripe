import { Entity, Column, Unique, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { User } from '../../users/interfaces/user.interface';
import { Payment } from '../interfaces/payment.interface';

@Entity("payments")
@Unique("index_name", ["id", "stripePaymentIntentId"])
export class PaymentEntity implements Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "stripe_payment_intent_id" })
    stripePaymentIntentId: string;

    @ManyToOne(type => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    status?: string;

    @Column({ type: "datetime", name: "created_at" })
    createdAt: Date;
}