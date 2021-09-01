### Step 1 - Back
Add folder `backend/stripe` in your `backend/src/api`.

Don't forget to add `StripeModule` in the imports of the `app.module`.

### Step 2 - Back
Add folder `backend/payment` in your `backend/src/api`.

Don't forget to add `PaymentModule` in the imports of the `app.module`.

### Step 3 - Back
Update `stripeSecretKey` in `StripeController` with the secretKey from your stripe account.
Update `stripeSecretKey` and `stripeWebhookSecretKey` in `StripeService` with the secretKey and webhook secret from your stripe account.

For the webhookSecret you need to create a webhook with these events:
- setup_intent.created
- setup_intent.requires_action
- setup_intent.canceled
- setup_intent.setup_failed
- setup_intent.succeeded
- payment_intent.created
- payment_intent.requires_action
- payment_intent.requires_capture
- payment_intent.canceled
- payment_intent.payment_failed
- payment_intent.succeeded

### Step 4 - Back
In user.interface.ts add this: `stripeCustomer?: string;`

In user.interface.ts add this: 
<pre>
    @Column({ nullable: true, select: false })
    stripeCustomer: string;
</pre>

### Step 5 - Back
In user.service.ts add following code : 

<pre>
    async updateStripeCustomer(
        userId: string,
        stripeCustomer
    ) {
        const userEntity = new UserEntity();

        userEntity.stripeCustomer = stripeCustomer;

        return await this.userRepository.update(userId, userEntity);
    }
    
</pre>

### Step 6 - Back
In backend install `npm install stripe@8.132.0`

### Step 7 - Back
Add following code in main.ts

<pre>
import * as bodyParser from 'body-parser';

(...)

const rawBodyBuffer = (req: any, res: any, buf: any, encoding: any) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
};

app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));
</pre>

### Step 8 - Front
Add folder `frontend/screenExample` in your `frontend/src/pages`.

And following code in pages.navigation.tsx :

```
    <Route exact path="/example" component={PaymentSiScreen} />
```

### Step 9 - Front
Add folder `frontend/services/stripe.service.ts` in your `frontend/services`.

### Step 10 - Front
In frontend install `npm install @stripe/stripe-js@1.11.0`

### Step 11 - Front
Add stripe public key in `PaymentSiScreen` :
<pre>
    stripeSecretKey: "pk_test_XxxXXXXxXXXXXXXxXXxxxxxXxxXXXXxXXXXXXXxXXxxxxxXxxXXXXxXXXXXXXxXXxxxxxXxxXXXXxXXXXXXXxXXxxxxx"
</pre>

### Bonus

If you want to contact your users when they correctly saved their card or when a delayed payment failed, you can use a mailer module and send mail in the webhook function in `stripe/stripe.service.ts`.

That's it ! :rocket:
