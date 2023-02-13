import { Flow } from "../../constants";
import { IMSCallInput, RequiredFCTOptions } from "../types";
export declare const manageCallId: (calls: IMSCallInput[], call: IMSCallInput, index: number) => string;
export declare const getSessionId: (salt: string, versionHex: string, options: RequiredFCTOptions) => string;
export declare const parseSessionID: (sessionId: string, builder: string) => {
    builder: string;
    recurrency: Partial<{
        maxRepeats: string;
        chillTime: string;
        accumetable: boolean;
    }>;
    multisig: {
        externalSigners?: string[] | undefined;
        minimumApprovals?: string | undefined;
    };
    validFrom: string;
    expiresAt: string;
    maxGasPrice: string;
    blockable: boolean;
    purgeable: boolean;
};
type CallIdResult<T extends boolean> = T extends true ? number : string;
export declare const parseCallID: (callId: string, jumpsAsNumbers?: boolean) => {
    options: {
        gasLimit: string;
        flow: Flow;
        jumpOnSuccess?: string | number | undefined;
        jumpOnFail?: string | number | undefined;
    };
    viewOnly: boolean;
    permissions: string;
    payerIndex: number;
    callIndex: number;
};
export {};
