import { Flow } from "../../constants";
import { IFCTOptions, IMSCallInput } from "../types";
export declare const manageCallId: (calls: IMSCallInput[], call: IMSCallInput, index: number) => string;
export declare const getSessionId: (salt: string, versionHex: string, options: IFCTOptions) => string;
export declare const parseSessionID: (sessionId: string, builder: string, externalSigners?: string[]) => IFCTOptions;
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
