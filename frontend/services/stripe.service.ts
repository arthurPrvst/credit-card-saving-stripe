import { post } from "./utils.service";
import { APIResponse } from "../models/api.model";

export const createSetupIntent = async (): Promise<APIResponse<any>> => {
    try {
        const res = await post(`/stripe/create-setup-intent`, {});
        return res.json();
    } catch (e) {
        return null;
    }
};
