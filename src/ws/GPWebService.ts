import * as path from 'path';
import {createClientAsync} from "soap";
import {gpSign, gpValidate} from "../lib/keys";
import {PaymentStatusResult} from "./types/results";

const WSDL_PATH = path.join(__dirname, '..', '..', 'wsdl', 'GPWebpayWebService.wsdl');

export class GPWebService {
    gatewayUrl: string;
    merchantNumber: string;
    privateKey?: string;
    privateKeyPass?: string;
    publicKey: string;

    constructor(
        gatewayUrl: string,
        merchantNumber: string,
        opts: { privateKey?: string; privateKeyPass?: string; publicKey: string }
    ) {
        this.gatewayUrl = gatewayUrl;
        this.merchantNumber = merchantNumber;
        this.publicKey = opts.publicKey;
        this.privateKey = opts.privateKey;
        this.privateKeyPass = opts.privateKeyPass;
    }

    async getPaymentStatus(paymentNumber: string | number, provider = '0880'): Promise<PaymentStatusResult> {
        if (!paymentNumber) throw new Error('paymentNumber is required');
        if (!this.privateKey) throw new Error('privateKey is required to sign the request');

        const messageId = this._generateMessageId();
        const signatureBase = this._buildRequestSignatureBase(messageId, provider, String(paymentNumber));
        const signature = gpSign(signatureBase, this.privateKey, this.privateKeyPass ?? "");

        const soapClient = await createClientAsync(WSDL_PATH, {endpoint: this.gatewayUrl});
        const res = await soapClient.getPaymentStatusAsync({
            paymentStatusRequest: {
                messageId: messageId,
                provider,
                merchantNumber: this.merchantNumber,
                paymentNumber,
                signature
            }
        });

        const result: PaymentStatusResult = res[0].paymentStatusResponse;

        if (!gpValidate(`${result.messageId}|${result.state}|${result.status}|${result.subStatus}`, result.signature, this.publicKey)) {
            throw new Error('Invalid signature of a response');
        }

        return result;
    }

    private _generateMessageId(): string {
        const d = new Date();
        const pad = (n: number, width = 2) => String(n).padStart(width, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hour = pad(d.getHours());
        const minute = pad(d.getMinutes());
        const second = pad(d.getSeconds());
        const ms = String(d.getMilliseconds()).padStart(3, '0');
        return `${year}${month}${day}${hour}${minute}${second}${ms}`;
    }

    private _buildRequestSignatureBase(messageId: string, provider: string, paymentNumber: string): string {
        return `${messageId}|${provider}|${this.merchantNumber}|${paymentNumber}`;
    }
}