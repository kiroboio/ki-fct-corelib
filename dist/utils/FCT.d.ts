import { SignatureLike } from "@ethersproject/bytes";
import { BatchMultiSigCallTypedData, IBatchMultiSigCallFCT, PartialBatchMultiSigCall } from "../batchMultiSigCall/types";
export declare const recoverAddressFromEIP712: (typedData: BatchMultiSigCallTypedData, signature: SignatureLike) => string | null;
export declare const getFCTMessageHash: (typedData: BatchMultiSigCallTypedData) => string;
export declare const validateFCT: <IFCT extends IBatchMultiSigCallFCT>(FCT: IFCT, softValidation?: boolean) => {
    getOptions: () => {
        valid_from: string;
        expires_at: string;
        gas_price_limit: string;
        blockable: boolean;
        purgeable: boolean;
        builder: string;
        recurrency: {
            maxRepeats?: string | undefined;
            chillTime?: string | undefined;
            accumetable?: boolean | undefined;
        };
        multisig: {
            externalSigners?: string[] | undefined;
            minimumApprovals?: string | undefined;
        };
    };
    getFCTMessageHash: () => string;
    getSigners: () => string[];
};
export declare const getVariablesAsBytes32: (variables: string[]) => string[];
export declare const getAllFCTPaths: (fct: PartialBatchMultiSigCall) => string[][];
