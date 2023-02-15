import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";
import { MethodParamsInterface, Param } from "../../types";
import { TypedDataDomain } from "../types";
export declare const getTypedDataDomain: (chainId: ChainId) => TypedDataDomain;
export declare const generateTxType: (item: Partial<MethodParamsInterface>) => {
    name: string;
    type: string;
}[];
export declare const getParamsFromInputs: (inputs: ethers.utils.ParamType[], values: ethers.utils.Result) => Param[];
