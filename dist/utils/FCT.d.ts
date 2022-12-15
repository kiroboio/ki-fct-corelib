import { SignatureLike } from "@ethersproject/bytes";
import { BatchMultiSigCallTypedData } from "../batchMultiSigCall/types";
import { IFCT } from "./types";
export declare const recoverAddressFromEIP712: (typedData: BatchMultiSigCallTypedData, signature: SignatureLike) => string | null;
export declare const getFCTMessageHash: (typedData: BatchMultiSigCallTypedData) => string;
export declare const validateFCT: (FCT: IFCT, softValidation?: boolean) => {
    getOptions: () => {
        valid_from: string;
        expires_at: string;
        gas_price_limit: string;
        builder: string;
    };
    getFCTMessageHash: () => string;
    getSigners: () => string[];
};
export declare const getVariablesAsBytes32: (variables: string[]) => string[];
