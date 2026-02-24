import GpWebpayOperation from './GPWebpay';
import {gpValidate, Key} from "./lib/keys";

interface GpWebpayResponseData {
    OPERATION: GpWebpayOperation,
    ORDERNUMBER: string,
    MERORDERNUM?: string,
    MD?: string,
    PRCODE: string,
    SRCODE: string,
    RESULTTEXT?: string,
    USERPARAM1?: string,
    ADDINFO?: string,
    TOKEN?: string,
    EXPIRY?: string,
    ACSRES?: string,
    ACCODE?: string,
    PANPATTERN?: string,
    DAYTOCAPTURE?: string,
    TOKENREGSTATUS?: string,
    ACRC?: string,
    RRN?: string,
    PAR?: string,
    TRACEID?: string,
    DIGEST: string,
    DIGEST1: string,
}

class GpWebpayResponse {
    private data: GpWebpayResponseData;
    merchantNumber: string;
    publicKey: Key;

    constructor(
        merchantNumber: string,
        data: GpWebpayResponseData,
        publicKey: Key,
    ) {
        this.data = data;
        this.merchantNumber = merchantNumber;
        this.publicKey = publicKey;

        if (!this.validateSignature()) {
            throw new Error('Response is not valid.');
        }
    }

    getOperation() {
        return this.data.OPERATION;
    }

    getOrderNumber() {
        return this.data.ORDERNUMBER;
    }

    getDigest() {
        return this.data.DIGEST;
    }

    getDigest1() {
        return this.data.DIGEST1;
    }

    getPrCode() {
        return this.data.PRCODE;
    }

    getSrCode() {
        return this.data.SRCODE;
    }

    getResultText() {
        return this.data.RESULTTEXT;
    }

    getSignatureBase() {
        const signKeys = [
            'OPERATION',
            'ORDERNUMBER',
            'MERORDERNUM',
            'MD',
            'PRCODE',
            'SRCODE',
            'RESULTTEXT',
            'USERPARAM1',
            'ADDINFO'
        ];

        const base = [];
        const values = Object.values(this.data);
        const keys = Object.keys(this.data);
        for (const key of signKeys) {
            const i = keys.indexOf(key);
            if (i >= 0) {
                base.push(values[i]);
            }
        }

        return base.join('|');
    }

    validateSignature() {
        const digestBase = this.getSignatureBase();
        /*
            Kontrolní podpis řetězce, který vznikne zřetězením všech zaslaných polí v uvedeném
            pořadí (bez pole DIGEST) a navíc pole MERCHANTNUMBER (pole není zasíláno,
            obchodník jej musí znát, pole se přidá na konec řetězce). Tímto způsobem je zvýšena
            bezpečnost a jednoznačnost odpovědi. Ověření podpisu je identické jako u pole DIGEST
         */
        const digest1Base = digestBase + '|' + this.merchantNumber;

        if (!gpValidate(digestBase, this.getDigest(), this.publicKey)) {
            return false;
        }

        return gpValidate(digest1Base, this.getDigest1(), this.publicKey);
    }
}

export default GpWebpayResponse;
export {
    GpWebpayResponseData,
};
