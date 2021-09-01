
### How does it work? ? ### 
This module uses Stripe's SetupIntent process. </br>
They are meant to save credit card info that can be later used as you wish. </br>
You can, for example, trigger a payment from the front using already saved info, or a direectly a cron in your backend. The backend will have to trigger a PaymentIntent to book the transaction. </br>

#### High picture of the workflow: ####
- User loads the page where he can save it's card. </br>
- Frontend asks backend to create a Stripe SetupIntent in order to let the user save it's card. </br>
- Backend creates the SetupIntent and returns the corresponding one time secret to the frontend. </br>
- User fills all info about it's card (number, CVV...) and does the 3DS authentication if needed. He press the "save my card" buttton. </br>
- Backend is receiving several notifications about the SetupIntent status thanks to a Webhook. It saves all payment status in database as logs records. </br>
- If the SetupIntent has a correct status (received from the webhook), the `stripeCustomer` is saved in database in the `User` table (so we can retrieve all it's card info later). </br>
- When you then want to trigger an offline payment for this user, backend only needs to ask stripe all card infos for this particular `stripeCustomer`. It then triggers a paymentIntent with all infos previously retrieved, and... TADA ! The delayed payment is done. </br>

[Stripe's official documentation](https://stripe.com/docs)