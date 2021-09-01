
### How does it work? ? ### 
This module uses Stripe's setup intent process. </br>
They are meant to saved credit card info that can be later used (with a trigger from the front or a cron in the back) to trigger a payment intent. </br>

#### High picture of the workflow: ####
- User load the page asking him to save it's card. </br>
- Frontend asks backend to create a Stripe SetupIntent in order to let the user save it's card. </br>
- Backend creates the SetupIntent and returns the corresponding one time secret to the frontend. </br>
- User fill all info about it's card (number, CVV...) and does the 3DS authentication if needed. He press the "save my card" buttton. </br>
- Backend is receiving notifications about the setupIntent status thanks to a Webhook. It saves the payment status in database. </br>
- If the setupIntent has a correct status (received from the webhook), the stripeCustomer is saved in database in the User table (so we can retrieve all it's card info later). </br>
- When you want to trigger an offline payment for this user, backend only needs to ask stripe all card infos for this particular stripeCustomerId. It then triggers a paymentIntent with all infos previously retrieved, and... TADA ! The delayed payment is done. </br>

[Stripe's official documentation](https://stripe.com/docs)