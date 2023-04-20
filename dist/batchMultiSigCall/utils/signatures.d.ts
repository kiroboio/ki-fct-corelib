import { BatchMultiSigCallTypedData } from "../types";
export declare const getAuthenticatorSignature: (typedData: BatchMultiSigCallTypedData) => import("ethers").Signature | {
    r: string;
    s: string;
    v: number;
};
