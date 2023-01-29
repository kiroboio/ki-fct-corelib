import { IFCTOptions, IMSCallInput } from "batchMultiSigCall/types";
import { Flow } from "../../constants";
export declare const manageFlow: (call: IMSCallInput) => string;
export declare const manageCallId: (calls: IMSCallInput[], call: IMSCallInput, index: number) => string;
export declare const getSessionId: (salt: string, options: IFCTOptions) => string;
export declare const parseSessionID: (sessionId: string, builder: string) => {
    builder: string;
    recurrency: {
        accumetable: boolean;
        chillTime: string;
        maxRepeats: string;
    };
    multisig: {
        minimumApprovals: number;
    };
    validFrom: string;
    expiresAt: string;
    maxGasPrice: string;
    blockable: boolean;
    purgeable: boolean;
};
export declare const parseCallID: (callId: string, jumpsAsNumbers?: boolean) => {
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
