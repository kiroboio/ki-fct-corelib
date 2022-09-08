import { TypedData } from "ethers-eip712";
import { MSCallOptions } from "./interfaces";
import { MSCallInput } from "./interfaces";
import { Flow } from "../constants";
export declare const handleMethodInterface: (call: MSCallInput) => string;
export declare const handleFunctionSignature: (call: MSCallInput) => string;
export declare const handleEnsHash: (call: MSCallInput) => string;
export declare const handleData: (call: MSCallInput) => string;
export declare const handleTypes: (call: MSCallInput) => number[];
export declare const handleTypedHashes: (call: MSCallInput, typedData: TypedData) => string[];
export declare const manageFlow: (call: MSCallInput) => string;
export declare const manageCallId: (call: MSCallInput, index: number) => string;
export declare const getSessionId: (salt: string, options: MSCallOptions) => string;
export declare const parseSessionID: (sessionId: string) => MSCallOptions;
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
