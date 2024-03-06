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
const tokens:TokenType = {
    id_token: undefined,
    refresh_token: undefined,
    fetched_at: undefined
}

async function getToken(): Promise<string> {
    if(tokens.id_token && tokens.fetched_at && !isOlderThan3000(tokens.fetched_at)){
        return tokens.id_token;
    }
    const config: AxiosRequestConfig = {
        headers: {
            'username' : constants.BKASH_USERNAME,
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
    if(!response.data.id_token) throw Error("Id token not found");
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
            intent: "sale"
        }, 
        config
    );
    if(!response.data.paymentID) throw Error("Payment create failed");
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
    if(!response.data.paymentID) throw Error("Payment execute failed");
    return response.data;
}

async function queryPayment(payload: QueryPaymentPayloadType, id_token: string): Promise<any> {
    const config: AxiosRequestConfig = {
        headers: {
            authorization: id_token,
            'x-app-key': constants.BKASH_API_KEY
        }
    };
    const response = await axios.post(
        constants.BKASH_QUERY_PAYMENT_API, 
        payload, 
        config
    );
    if(!response.data.paymentID) throw Error("Payment query failed");
    return response.data;
}

bkashController.post('/create', async (req: Request<any, any, CreatePaymentPayloadType>, res) => {
    try {
        const id_token = await getToken();
        const result: CreatePaymentResponseType = await createPayment(req.body, id_token);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

bkashController.post('/execute', async (req: Request<any, any, ExecutePaymentPayloadType>, res) => {
    try {
        const id_token = await getToken();
        const result: ExecutePaymentResponseType = await executePayment(req.body, id_token);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

bkashController.post('/query', async (req: Request<any, any, QueryPaymentPayloadType>, res) => {
    try {
        const id_token = await getToken();
        const result: QueryPaymentResponseType = await queryPayment(req.body, id_token);
        return res.status(201).json(result);
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
});

// bkashController.post('/execute', async (req, res) => {
//     try {
//         const { paymentID } = req.body;
//         if (!paymentID || paymentID === '') throw new Error('Invalid Payment ID provided');
//         const result = await bkash.executePayment(paymentID);
//         return res.json(result);
//     } catch (error: any) {
//         return res.status(400).json({ success: false, message: error.message });
//     }
// });

// bkashController.get('/query/:paymentID', async (req, res) => {
//     try {
//         const paymentID = req.params.paymentID;
//         if (!paymentID || paymentID === '') throw new Error('Invalid Payment ID provided');
//         const result = await bkash.queryPayment(paymentID);
//         return res.json({ success: true, data: result });
//     } catch (error: any) {
//         return res.status(400).json({ success: false, message: error.message });
//     }
// });

// bkashController.get('/search/:trxID', async (req, res) => {
//     try {
//         const trxID = req.params.trxID;
//         if (!trxID || trxID === '') throw new Error('Invalid Transaction ID provided');
//         const result = await bkash.searchTransaction(trxID);
//         return res.json({ success: true, data: result });
//     } catch (error: any) {
//         return res.status(400).json({ success: false, message: error.message });
//     }
// });

// bkashController.post('/refund', async (req, res) => {
//     try {
//         const { paymentID, amount, trxID, sku } = req.body; //validate input here
//         const refunTransactionData = {
//             paymentID,
//             amount,
//             trxID,
//             sku,
//         };
//         const result = await bkash.refundTransaction(refunTransactionData);
//         return res.status(201).json({ success: true, data: result });
//     } catch (error: any) {
//         return res.status(400).json({ success: false, message: error.message });
//     }
// });