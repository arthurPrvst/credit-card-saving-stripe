import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { User } from '../../users/interfaces/user.interface';
import { StripeLogs } from '../interfaces/stripe-logs.interface';

@Entity("stripe_logs")
export class StripeLogsEntity implements StripeLogs {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    status: "payment_intent.created" | "payment_intent.payment_failed" | "payment_intent.succeeded";
    
    @Column()
    timestamp: Date;
}