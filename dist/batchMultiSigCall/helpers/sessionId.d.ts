import { IMSCallInput, MSCallOptions } from "batchMultiSigCall/interfaces";
import { Flow } from "../../constants";
export declare const manageFlow: (call: IMSCallInput) => string;
export declare const manageCallId: (calls: IMSCallInput[], call: IMSCallInput, index: number) => string;
export declare const getSessionId: (salt: string, options: MSCallOptions) => string;
export declare const parseSessionID: (sessionId: string, builder: string) => MSCallOptions;
export declare const parseCallID: (callId: string) => {
    options: {
        gasLimit: number;
        flow: Flow;
        jumpOnSuccess: number;
        jumpOnFail: number;
    };
    viewOnly: boolean;
    permissions: string;
    payerIndex: number;
    callIndex: number;
};
