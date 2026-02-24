import {readFileSync} from 'fs';
import {GPWebService, PaymentStatusResult} from "../../src";


const publicKey = readFileSync('test/publicKey.pem').toString();
const privateKey = readFileSync('test/privateKey.pem').toString();
const privateKeyPass = 'TestKey2000+';

const soapGateway = 'https://test.3dsecure.gpwebpay.com/pay-ws/v1/PaymentService';
const merchantNumber = '123456789';

describe('GPWebService call', () => {
    test('calls getPaymentStatus on a test gateway', async () => {
        const orderNumber = 3008;

        const svc = new GPWebService(soapGateway, merchantNumber, {privateKey, privateKeyPass, publicKey});

        const result: PaymentStatusResult = await svc.getPaymentStatus(orderNumber);

        expect(result).toBeDefined();
    });
});
