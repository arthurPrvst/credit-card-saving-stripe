import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { StripeLogsEntity } from './entities/stripe-logs.entity'
import { UsersService } from '../users/users.service';
import { PaymentService } from '../payment/payment.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class StripeService {
    private stripe: Stripe;
    private stripeSecretKey : "FOR_EXAMPLE_ONLY" // should not be hardcoded and pushed. Add it in your prod env
    private stripeWebhookSecretKey : "FOR_EXAMPLE_ONLY" // should not be hardcoded and pushed. Add it in your prod env

    constructor(@InjectRepository(StripeLogsEntity) private stripeLogsRepository: Repository<StripeLogsEntity>,
        private paymentService: PaymentService,
        private usersService: UsersService) {
        this.stripe = new Stripe(this.stripeSecretKey, {
            apiVersion: '2020-08-27',
        });
    }

    async createLogs(user, status): Promise<StripeLogsEntity> {
        const stripeLogsEntity = new StripeLogsEntity();
        stripeLogsEntity.user = user;
        stripeLogsEntity.timestamp = new Date();
        stripeLogsEntity.status = status;

        return await this.stripeLogsRepository.save(stripeLogsEntity);
    }

   /**
   * Webhook gérant les paiments Stripe.
   * @param {any} req Objet "req" d'Express.
   */
    async paymentWebhook(req: any): Promise<{ responseStatusCode: number }> {
        let data: any;
        let event: Stripe.Event;
        let cardIntent: any;

        try {
            // Check if webhook signing is configured.
            if (this.stripeWebhookSecretKey) {
                let signature: any = req.headers['stripe-signature'];
                try {
                    event = this.stripe.webhooks.constructEvent(
                        req.rawBody,
                        signature,
                        this.stripeWebhookSecretKey
                    );
                } catch (err) {
                    console.log("err", err);
                    console.log('La signature de vérification du Webhook a échouée.');
                    return { responseStatusCode: 400 };
                }
                data = event.data;
            } else {
                throw new Error(
                    "No Stripe webhook.",
                );
            }

            let id = data.object.metadata.userId;
            let user = await this.usersService.findOne({ id });
            console.log("Will process payment update for userId =", id);
            
            cardIntent = event.data.object;
            let paymentEntity = await this.paymentService.getPayment(cardIntent.id);
            console.log("Will handle event.type", event.type);

            /* WARNING : Unordered async flow !!
                Event about the creation of the paymentIntent may be sent after the event where we know it's a success
            */
            switch (event.type) {
                /*
                    SetupIntent : statuses to save customer cards for a delay payment
                    PaymentIntent : statuses for a one-time payment without any delay
                */
                case 'setup_intent.created':
                    console.log(`SetupIntent for ${JSON.stringify(cardIntent.id)} will be created!`);
                    await this.paymentService.createPayment(user, cardIntent.id, "setup_intent.created");
                    await this.createLogs(user, "setup_intent.created");

                    console.log(`Customer ${JSON.stringify(cardIntent.customer)} will be created!`);
                    await this.usersService.updateStripeCustomer(user, cardIntent.customer);

                    return { responseStatusCode: 200 };

                case 'setup_intent.requires_action':
                    console.log(`SetupIntent for ${JSON.stringify(cardIntent.id)} requires an action!`);
                    await this.createLogs(user, "setup_intent.requires_action");
                    await this.paymentService.createPayment(user, cardIntent.id, "setup_intent.requires_action");
                    
                    return { responseStatusCode: 200 };

                case 'setup_intent.canceled':
                    console.log(`SetupIntent for ${JSON.stringify(cardIntent.id)} canceled!`);
                    await this.createLogs(user, "setup_intent.canceled");
                    await this.paymentService.createPayment(user, cardIntent.id, "setup_intent.canceled");

                    return { responseStatusCode: 200 };

                case 'setup_intent.setup_failed':
                    console.log(`SetupIntent for ${JSON.stringify(cardIntent.id)} failed!`);
                    await this.createLogs(user, "setup_intent.setup_failed");
                    await this.paymentService.createPayment(user, cardIntent.id, "setup_intent.setup_failed");

                    return { responseStatusCode: 200 };

                case 'setup_intent.succeeded':
                    console.log(`SetupIntent for ${JSON.stringify(cardIntent.id)} was succesfull!`);
                    await this.createLogs(user, "setup_intent.succeeded");
                    await this.paymentService.createPayment(user, cardIntent.id, "setup_intent.succeeded");

                    return { responseStatusCode: 200 };

                case 'payment_intent.created':
                    console.log(`PaymentIntent for ${JSON.stringify(cardIntent.id)} will be created!`);
                    await this.createLogs(user, "payment_intent.created");
                    await this.paymentService.createPayment(user, cardIntent.id, "payment_intent.created");

                    return { responseStatusCode: 200 };

                case 'payment_intent.requires_action':
                    console.log(`PaymentIntent for ${JSON.stringify(cardIntent.id)} requires an action!`);
                    await this.createLogs(user, "payment_intent.requires_action");
                    await this.paymentService.createPayment(user, cardIntent.id, "payment_intent.requires_action");

                    return { responseStatusCode: 200 };

                // If we separately authorizing and capturing funds, PaymentIntent may also move to requires_capture.
                case 'payment_intent.requires_capture':
                    console.log(`PaymentIntent for ${JSON.stringify(cardIntent.id)} requires a capture!`);
                    await this.createLogs(user, "payment_intent.requires_capture");
                    await this.paymentService.createPayment(user, cardIntent.id, "payment_intent.requires_capture");

                    return { responseStatusCode: 200 };

                case 'payment_intent.canceled':
                    console.log(`PaymentIntent for ${JSON.stringify(cardIntent.id)} canceled!`);
                    await this.createLogs(user, "payment_intent.canceled");
                    this.paymentService.createPayment(user, cardIntent.id, "payment_intent.canceled");

                    return { responseStatusCode: 200 };

                case 'payment_intent.payment_failed':
                    console.log(`PaymentIntent for ${JSON.stringify(cardIntent.id)} failed!`);
                    await this.createLogs(user, "payment_intent.payment_failed");
                    await this.paymentService.createPayment(user, cardIntent.id, "payment_intent.payment_failed");

                    return { responseStatusCode: 200 };

                case 'payment_intent.succeeded':
                    console.log(`PaymentIntent for ${JSON.stringify(cardIntent.id)} was successful!`);
                    await this.createLogs(user, "payment_intent.succeeded");
                    await this.paymentService.createPayment(user, cardIntent.id, "payment_intent.succeeded");

                    return { responseStatusCode: 200 };
                
                default:
                    console.log('[STRIPE] unhandled event type');
                    console.log('[STRIPE] event.type :>>', event.type);
                    return { responseStatusCode: 200 };
            }
        } catch (err) {
            console.log("err", err);
            return { responseStatusCode: 500 };
        }
    }

    async triggerPayment(userId: number): Promise<boolean> {
        const user = await this.usersService.findOne({id: userId});

        let paymentSuccess = true;
        const customerCard = await this.stripe.paymentMethods.list({
            customer: user.stripeCustomer,
            type: 'card',
        });

        try {
            await this.stripe.paymentIntents.create({
              amount: 39*100,
              currency: 'eur',
              customer: user.stripeCustomer,
              payment_method: customerCard.data[0].id,
              off_session: true,
              confirm: true,
            });

          } catch (err) {  // Error code will be authentication_required if authentication is needed
            paymentSuccess = false
            console.error('Error code is: ', err.code);
            const paymentIntentRetrieved = await this.stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
          }

        return paymentSuccess;
    }
}
