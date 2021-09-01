import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './interfaces/payment.interface';
import { PaymentEntity } from './entities/payment.entity';
import { User } from '../users/interfaces/user.interface';
import { stringMap } from 'aws-sdk/clients/finspacedata';

@Injectable()
export class PaymentService {

    constructor(@InjectRepository(PaymentEntity) private paymentRepository: Repository<PaymentEntity>) { }

    async createPayment(user: User, paymentIntentId: string, status: any): Promise<PaymentEntity> {
        const payment = new PaymentEntity();
        payment.user = user;
        payment.stripePaymentIntentId = paymentIntentId;
        payment.status = status;
        payment.createdAt = new Date();

        return await this.paymentRepository.save(payment);
    }

    async getPayment(stripePaymentIntentId: string): Promise<Payment> {
        return await this.paymentRepository
            .createQueryBuilder("payments")
            .select([
                "payments.id",
                "payments.stripePaymentIntentId",
                "payments.status"
            ])
            .getOne()
    }

    async myPayments(user: User): Promise<any> {
        return await this.paymentRepository.createQueryBuilder("payments")
        .select([
            "payments.id",
            "payments.status",
            "payments.createdAt",
            "payments.user",
        ])
        .where("payments.user = :userId", { userId: user.id })
        .getMany();
    }

}
