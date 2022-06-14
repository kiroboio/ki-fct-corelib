import { BatchCallBase } from "../interfaces";
export interface TransferPackedInputInterface extends BatchCallBase {
    token: string;
    to: string;
    value: number;
    signer: string;
    groupId: number;
    nonce: number;
}
export interface TransferPackedInterface {
    signer: string;
    token: string;
    to: string;
    value: number;
    sessionId: string;
    hashedData: string;
    unhashedCall: TransferPackedInputInterface;
}
