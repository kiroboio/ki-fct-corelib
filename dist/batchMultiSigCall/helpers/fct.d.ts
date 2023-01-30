import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { MethodParamsInterface } from "@types";
interface TypedDataDomain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
}
export declare const getTypedDataDomain: (chainId: ChainId) => TypedDataDomain;
export declare const generateTxType: (item: Partial<MethodParamsInterface>) => {
    name: string;
    type: string;
}[];
export {};
