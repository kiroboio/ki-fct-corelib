import { BatchCallBase } from "../interfaces";
export interface TransferPackedInputInterface extends BatchCallBase {
    token: string;
    to: string;
    value: number;
    signer: string;
}
export interface TransferPackedInterface {
    signer: string;
    token: string;
    to: string;
    value: number;
    sessionId: string;
    encodedMessage: string;
    unhashedCall: TransferPackedInputInterface;
}
