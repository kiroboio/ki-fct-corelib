import { BatchFlags, MultiCallFlags } from "../interfaces";
export interface MultiSigCallPackedInputInterface {
    value: string;
    to: string;
    data: string;
    signer: string;
    gasLimit?: number;
    flags?: Partial<MultiCallFlags>;
}
export interface BatchMultiSigCallPackedInputInterface {
    groupId: number;
    nonce: number;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: Partial<BatchFlags>;
    calls: MultiSigCallPackedInputInterface[];
}
export interface MultiSigCallPacked {
    value: string;
    signer: string;
    gasLimit: number;
    flags: string;
    to: string;
    method?: string;
    params?: string;
    encodedTx: string;
}
export interface BatchMultiSigCallPackedInterface {
    sessionId: string;
    encodedLimits: string;
    encodedData: string;
    unhashedCall: BatchMultiSigCallPackedInputInterface;
    mcall: MultiSigCallPacked[];
}
