import { BatchFlags } from "../interfaces";
export interface TransferPackedInputInterface {
    token: string;
    to: string;
    value: number;
    signer: string;
    groupId: number;
    nonce: number;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: Partial<BatchFlags>;
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
