import { User } from "../../users/interfaces/user.interface";

// https://stripe.com/docs/payments/intents#intent-statuses
export interface Payment {
    id?: number;
    stripePaymentIntentId?: string;
    user?: User;
    status?: string;
    createdAt?: Date;
}