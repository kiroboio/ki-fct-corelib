import { BatchMultiSigCallInputInterface, BatchMultiSigCallInterface, MultiSigCallInterface } from "./interfaces";
export declare class MultiSigCall {
    typeHash: string;
    sessionId: string;
    typedData: object;
    encodedMessage: string;
    encodedLimits: string;
    inputData: BatchMultiSigCallInputInterface;
    mcall: MultiSigCallInterface[];
    private getBatchMultiSigCall;
    constructor(object: BatchMultiSigCallInterface, getBatchMultiSigCall: any);
    addCall(call: MultiSigCallInterface): Promise<void>;
}
