import {PaymentStatus, PaymentStatusState, PaymentStatusSubstatus} from "./params";

export type PaymentStatusResult = {
    messageId: string;
    state: PaymentStatusState;
    status: PaymentStatus;
    subStatus: PaymentStatusSubstatus;
    signature: string;
};
