import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../../shared/config/config.module';
import { UsersModule } from '../users/users.module';
import { UsersCompatibilitiesModule } from '../users-compatibilities/users-compatibilites.module';
import { MatchsModule } from '../matchs/matchs.module';
import { MailerModule } from '../../shared/mailer/mailer.module';
import { PaymentModule } from '../payment/payment.module';
import { StripeLogsEntity } from './entities/stripe-logs.entity';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { SubscriptionModule } from '../subscription/subscription.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      StripeLogsEntity
    ]),
    ConfigModule,
    UsersModule,
    MatchsModule,
    PaymentModule,
    SubscriptionModule,
    MailerModule,
    UsersCompatibilitiesModule,

  ],
  controllers: [
    StripeController
  ],
  providers: [
    StripeService
  ]
})
export class StripeModule { }
