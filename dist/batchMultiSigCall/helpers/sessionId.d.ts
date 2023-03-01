import { Flow } from "../../constants";
import { IMSCallInput, RequiredFCTOptions, StrictMSCallInput } from "../types";
export declare const manageCallId: (calls: IMSCallInput[], call: StrictMSCallInput, index: number) => string;
export declare const getSessionId: (salt: string, versionHex: string, options: RequiredFCTOptions) => string;
export declare const parseSessionID: (sessionId: string, builder: string, externalSigners?: string[]) => RequiredFCTOptions;
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
