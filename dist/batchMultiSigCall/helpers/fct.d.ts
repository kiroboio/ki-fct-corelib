import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { MethodParamsInterface } from "../../types";
import { TypedDataDomain } from "../types";
export declare const getTypedDataDomain: (chainId: ChainId) => TypedDataDomain;
export declare const generateTxType: (item: Partial<MethodParamsInterface>) => {
    name: string;
    type: string;
}[];
