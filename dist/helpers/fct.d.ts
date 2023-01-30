import { ChainId } from "../batchMultiSigCall/batchMultiSigCall";
import { MethodParamsInterface } from "../types";
export declare const getTypedDataDomain: (chainId: ChainId) => {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
} | {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
};
export declare const generateTxType: (item: Partial<MethodParamsInterface>) => {
    name: string;
    type: string;
}[];
