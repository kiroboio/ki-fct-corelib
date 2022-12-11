import { IMSCallInput, MSCallOptions } from "batchMultiSigCall/interfaces";
import { Flow } from "../../constants";
export declare const manageFlow: (call: IMSCallInput) => string;
export declare const manageCallId: (calls: IMSCallInput[], call: IMSCallInput, index: number) => string;
export declare const getSessionId: (salt: string, options: MSCallOptions) => string;
export declare const parseSessionID: (sessionId: string, builder: string) => MSCallOptions;
export declare const parseCallID: (callId: string) => {
    options: {
        gasLimit: string;
        flow: Flow;
        jumpOnSuccess?: string;
        jumpOnFail?: string;
    };
    viewOnly: boolean;
    permissions: string;
    payerIndex: number;
    callIndex: number;
};
