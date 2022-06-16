import { BatchCallBase, MultiCallBase } from "../interfaces";
export interface MultiCallInputInterface extends MultiCallBase {
    value: string;
    toEnsHash?: string;
    to: string;
}
export interface BatchMultiCallInputInterface extends BatchCallBase {
    signer: string;
    calls: MultiCallInputInterface[];
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
export interface BatchMultiCallInterface {
    typeHash: Uint8Array;
    sessionId: string;
    signer: string;
    encodedMessage: string;
    encodedLimits: string;
    typedData: object;
    unhashedCall: BatchMultiCallInputInterface;
    mcall: MultiCall[];
}
