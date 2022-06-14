import { Params } from "../interfaces";
export interface Flags {
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
}
export interface BatchCallInputInterface {
    value: string;
    to: string;
    toEnsHash?: string;
    signer: string;
    groupId: number;
    nonce: number;
    data?: string;
    method?: string;
    params?: Params[];
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: Flags;
}
export interface BatchCallInterface {
    typeHash: string;
    to: string;
    ensHash: string;
    value: string;
    sessionId: string;
    signer: string;
    functionSignature: string;
    data: string;
    typedData: Object;
    hashedMessage: string;
    hashedTxMessage: string;
    unhashedCall: BatchCallInputInterface;
}
