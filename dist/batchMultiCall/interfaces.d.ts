export interface Params {
    name: string;
    type: string;
    value: string;
}
export interface DecodeTx {
    encodedData: string;
    encodedDetails: string;
    params?: Params[];
}
export interface MultiCallFlags {
    viewOnly?: boolean;
    continueOnFail?: boolean;
    stopOnFail?: boolean;
    stopOnSuccess?: boolean;
    revertOnSuccess?: boolean;
}
export interface BatchFlags {
    staticCall?: boolean;
    cancelable?: boolean;
    payment?: boolean;
}
export interface MultiCallInputData {
    value: string;
    to: string;
    data?: string;
    method?: string;
    params?: Params[];
    toEnsHash?: string;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: MultiCallFlags;
}
export interface BatchMultiCallInputData {
    groupId: number;
    nonce: number;
    signer: string;
    afterTimestamp?: number;
    beforeTimestamp?: number;
    maxGas?: number;
    maxGasPrice?: number;
    flags?: BatchFlags;
    multiCalls: MultiCallInputData[];
}
export interface MultiCall {
    value: string;
    to: string;
    data: string;
    ensHash: string;
    typeHash: Uint8Array;
    flags: string;
    functionSignature: string;
    gasLimit: number;
}
export interface BatchMultiCallData {
    typeHash: Uint8Array;
    sessionId: string;
    signer: string;
    encodedMessage: string;
    encodedLimits: string;
    typedData: object;
    mcall: MultiCall[];
}
