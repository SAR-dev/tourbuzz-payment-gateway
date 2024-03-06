// PAYLOADS
export interface CreatePaymentPayloadType {
    mode: string,
    payerReference: string,
    callbackURL: string,
    merchantAssociationInfo: string,
    amount: string,
    currency: string,
    intent: string,
    merchantInvoiceNumber: string
}

export interface ExecutePaymentPayloadType {
    paymentID: string
}

export interface QueryPaymentPayloadType {
    paymentID: string
}

// RESPONSES
export interface CreatePaymentResponseType {
    paymentID: string;
    bkashURL: string;
    callbackURL: string;
    successCallbackURL: string;
    failureCallbackURL: string;
    cancelledCallbackURL: string;
    amount: string;
    intent: string;
    currency: string;
    paymentCreateTime: string;
    transactionStatus: string;
    merchantInvoiceNumber: string;
    statusCode: string;
    statusMessage: string;
}

export interface ExecutePaymentResponseType {
    statusCode: string;
    statusMessage: string;
    paymentID: string;
    payerReference: string;
    customerMsisdn: string;
    trxID: string;
    amount: string;
    transactionStatus: string;
    paymentExecuteTime: string;
    currency: string;
    intent: string;
    merchantInvoiceNumber: string;
}

export interface QueryPaymentResponseType {
    statusCode: string;
    statusMessage: string;
    paymentID: string;
    mode: string;
    paymentCreateTime: string;
    amount: string;
    currency: string;
    intent: string;
    merchantInvoice: string;
    transactionStatus: string;
    verificationStatus: string;
    payerReference: string;
    agreementID: string;
    agreementStatus: string;
    agreementCreateTime: string;
    agreementExecuteTime: string;
}