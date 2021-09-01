import { User } from "../../users/interfaces/user.interface";

export interface StripeLogs {
    id?: number;
    user?: User;
    status?: "payment_intent.created" | "payment_intent.payment_failed" | "payment_intent.succeeded";
    timestamp?: Date;
}