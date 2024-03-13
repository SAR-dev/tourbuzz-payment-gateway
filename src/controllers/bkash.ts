import { Router, Request } from "express";
import { CreatePaymentPayloadType, CreatePaymentResponseType, ExecutePaymentPayloadType, ExecutePaymentResponseType, QueryPaymentPayloadType, QueryPaymentResponseType } from "../types/bkash";
import axios, { AxiosRequestConfig } from 'axios';
import constants from "../constants";
import { isOlderThan3000 } from "../helpers";

export const bkashController = Router();

interface TokenType {
    id_token?: string
    refresh_token?: string
    fetched_at?: number
}
const tokens: TokenType = {
    id_token: undefined,
    refresh_token: undefined,
    fetched_at: undefined
}

async function getToken(): Promise<string> {
    if (tokens.id_token && tokens.fetched_at && !isOlderThan3000(tokens.fetched_at)) {
        return tokens.id_token;
    }
    const config: AxiosRequestConfig = {
        headers: {
            'username': constants.BKASH_USERNAME,
            'password': constants.BKASH_PASSWORD
        }
    };
    const payload = {
        app_key: constants.BKASH_API_KEY,
        app_secret: constants.BKASH_API_SECRET
    }
    const response = await axios.post(
        constants.BKASH_GRANT_TOKEN_API,
        payload,
        config
    );
    if (!response.data.id_token) throw Error("Id token not found");
    tokens.id_token = response.data.id_token;
    tokens.refresh_token = response.data.refresh_token;
    tokens.fetched_at = Date.now()
    return response.data.id_token;
}

async function createPayment(payload: CreatePaymentPayloadType, id_token: string): Promise<any> {
    const config: AxiosRequestConfig = {
        headers: {
            authorization: id_token,
            'x-app-key': constants.BKASH_API_KEY
        }
    };
    const response = await axios.post(
        constants.BKASH_CREATE_PAYMNET_API,
        {
            ...payload,
            mode: "0011",
            currency: "BDT",
            intent: "sale",
            callbackURL: 'http://localhost:3300/payment/callback'
        },
        config
    );
    if (!response.data.paymentID) throw Error("Payment create failed");
    return response.data;
}

async function executePayment(payload: ExecutePaymentPayloadType, id_token: string): Promise<any> {
    const config: AxiosRequestConfig = {
        headers: {
            authorization: id_token,
            'x-app-key': constants.BKASH_API_KEY
        }
    };
    const response = await axios.post(
        constants.BKASH_EXECUTE_PAYMENT_API,
        payload,
        config
    );
    if (!response.data.paymentID) throw Error("Payment execute failed");
    return response.data;
}

// async function queryPayment(payload: QueryPaymentPayloadType, id_token: string): Promise<any> {
//     const config: AxiosRequestConfig = {
//         headers: {
//             authorization: id_token,
//             'x-app-key': constants.BKASH_API_KEY
//         }
//     };
//     const response = await axios.post(
//         constants.BKASH_QUERY_PAYMENT_API,
//         payload,
//         config
//     );
//     if (!response.data.paymentID) throw Error("Payment query failed");
//     return response.data;
// }

bkashController.post('/create', async (req: Request<any, any, CreatePaymentPayloadType>, res) => {
    try {
        const id_token = await getToken();
        const result: CreatePaymentResponseType = await createPayment(req.body, id_token);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

bkashController.get('/payment/callback', async (req: Request<any, any>, res) => {
    const { paymentID, status } = req.query
    const payment_id = paymentID?.toString()
    if (!payment_id || status != "success") return;

    try {
        const id_token = await getToken();
        const data = await executePayment({ paymentID: payment_id }, id_token)
        return res.status(201).json(data);
        // handle db here
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

// bkashController.post('/query', async (req: Request<any, any, QueryPaymentPayloadType>, res) => {
//     try {
//         const id_token = await getToken();
//         const result: QueryPaymentResponseType = await queryPayment(req.body, id_token);
//         return res.status(201).json(result);
//     } catch (error: any) {
//         return res.status(400).json({ success: false, message: error.message });
//     }
// });

