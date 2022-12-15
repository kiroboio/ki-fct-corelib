import { Contract } from "ethers";
import { MethodParamsInterface } from "../types";
export declare const getTypedDataDomain: (factoryProxy: Contract) => Promise<{
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
}>;
export declare const generateTxType: (item: Partial<MethodParamsInterface>) => {
    name: string;
    type: string;
}[];
