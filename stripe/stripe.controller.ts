import { Body, Controller, Post, Req, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import Stripe from 'stripe';
import { AuthUser } from '../../shared/decorators/auth-user.decorator';
import { Roles } from '../../shared/decorators/roles.decorators';
import { StripeService } from './stripe.service';
import { UsersService } from '../users/users.service';

@Controller('stripe')
export class StripeController {
    private stripe: Stripe;
    private stripeSecretKey : "FOR_EXAMPLE_ONLY" // should not be hardcoded and pushed. Add it in your prod env

    constructor(
        private stripeService: StripeService,  
        private userService: UsersService) {
        this.stripe = new Stripe(this.stripeSecretKey, {
            apiVersion: '2020-08-27',
        });
    }

    @Post('/create-setup-intent')
    @Roles('user', 'premium', 'admin')
    async createSetupIntent(@AuthUser() authUser, @Body() body) {
        const user = await this.userService.findOne(authUser.id);

        // Create the customer on Stripe's side
        const customer = await this.stripe.customers.create();
        const setupIntentStripeId = customer.id;

        // Create a SetupIntent to all the money to be retrived after
        const setupIntent =  await this.stripe.setupIntents.create({
            customer: setupIntentStripeId,
            usage: 'off_session',
            metadata: { 
                userId: user.id,
                hash: body.hash
            },
        });

        console.log("SetupIntent =", setupIntent.client_secret);
        
        return {
            clientSecret: setupIntent.client_secret
        };
    }

    @Post('/force-payment')
    @Roles('admin')
    async forcePayment(@Body() body) {
        return await this.stripeService.triggerPayment(body.userId, body.hash);
    }
                
    @Post('webhook')
    async stripeWebhookPayment(@Req() req: any, @Res() res: Response) {
        const { responseStatusCode } = await this.stripeService.paymentWebhook(req);
        res.sendStatus(responseStatusCode);
    }

}
