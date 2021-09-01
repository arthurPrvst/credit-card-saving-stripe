import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentEntity
    ]),
  ],
  providers: [
    PaymentService
  ],
  controllers: [
    PaymentController
  ],
  exports: [
    PaymentService
  ]
})
export class PaymentModule { }
