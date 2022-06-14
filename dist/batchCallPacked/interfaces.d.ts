import { BatchFlags, Params } from "../interfaces";
export interface BatchCallInputInterface {
    value: string;
    to: string;
    data: string;
    method: string;
    params: Params[];
    signer: string;
    groupId: number;
    nonce: number;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: Partial<BatchFlags>;
}
export interface BatchCallInterface {
    to: string;
    value: string;
    sessionId: string;
    signer: string;
    data: string;
    hashedData: string;
    unhashedCall: BatchCallInputInterface;
}
