import Web3 from "web3";
import Contract from "web3/eth/contract";
import { TypedData } from "ethers-eip712";
import { BatchCallBase, BatchFlags, MethodParamsInterface, MultiCallFlags } from "./interfaces";
export declare const getSessionIdDetails: (call: BatchCallBase, defaultFlags: Partial<BatchFlags>, smallFlags: boolean) => {
    group: string;
    nonce: string;
    after: string;
    before: string;
    maxGas: string;
    maxGasPrice: string;
    flags: string;
    pureFlags: {
        staticCall?: boolean;
        cancelable?: boolean;
        payment?: boolean;
        eip712?: boolean;
        flow?: boolean;
    };
    sessionId: string;
};
export declare const getFlags: (flags: Partial<BatchFlags>, small: boolean) => string;
export declare const manageCallFlags: (flags: Partial<MultiCallFlags>) => string;
export declare const getMethodInterface: (call: Partial<MethodParamsInterface>) => string;
export declare const getTypeHash: (typedData: TypedData) => string;
export declare const getTypedDataDomain: (web3: Web3, factoryProxy: Contract, factoryProxyAddress: string) => Promise<{
    name: any;
    version: any;
    chainId: number;
    verifyingContract: string;
    salt: any;
}>;
export declare const getEncodedMethodParams: (call: Partial<MethodParamsInterface>, withFunction?: boolean) => string;
export declare const generateTxType: (item: Partial<MethodParamsInterface>) => {
    name: string;
    type: string;
}[];
export declare const getParamsLength: (encodedParams: string) => string;
export declare const getParamsOffset: (params: any) => string;
