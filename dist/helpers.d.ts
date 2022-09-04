import { ethers } from "ethers";
import Contract from "web3/eth/contract";
import { TypedData, TypedDataTypes } from "ethers-eip712";
import { BatchCallBase, BatchFlags, MethodParamsInterface, MultiCallFlags, Params, Validator } from "./interfaces";
import { MSCallInput } from "./batchMultiSigCall_Old/interfaces";
import { Flow } from "./constants";
export declare const flows: {
    OK_CONT_FAIL_REVERT: {
        text: string;
        value: string;
    };
    OK_CONT_FAIL_STOP: {
        text: string;
        value: string;
    };
    OK_CONT_FAIL_CONT: {
        text: string;
        value: string;
    };
    OK_REVERT_FAIL_CONT: {
        text: string;
        value: string;
    };
    OK_REVERT_FAIL_STOP: {
        text: string;
        value: string;
    };
    OK_STOP_FAIL_CONT: {
        text: string;
        value: string;
    };
    OK_STOP_FAIL_REVERT: {
        text: string;
        value: string;
    };
};
export declare const getTypesArray: (params: Params[]) => number[];
export declare const getTypedHashes: (params: Params[], typedData: {
    types: TypedDataTypes;
}) => string[];
export declare const getSessionIdDetails: (call: BatchCallBase, defaultFlags: Partial<BatchFlags>, smallFlags: boolean) => {
    group: string;
    nonce: string;
    after: string;
    before: string;
    gasLimit: string;
    maxGasPrice: string;
    flags: string;
    pureFlags: {
        viewOnly?: boolean;
        cancelable?: boolean;
        payment?: boolean;
        eip712?: boolean;
        flow?: boolean;
    };
    sessionId: string;
};
export declare const getFlags: (flags: Partial<BatchFlags>, small: boolean) => string;
export declare const manageCallFlags: (flags: Partial<MultiCallFlags>) => string;
export declare const manageCallFlagsV2: (flow: Flow | string, jump: number) => string;
export declare const getMethodInterface: (call: Partial<MethodParamsInterface>) => string;
export declare const getTypeHash: (typedData: TypedData) => string;
export declare const getTypedDataDomain: (factoryProxy: ethers.Contract) => Promise<{
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
}>;
export declare const getEncodedMethodParams: (call: Partial<MethodParamsInterface>, withFunction?: boolean) => string;
export declare const generateTxType: (item: Partial<MethodParamsInterface>) => {
    name: string;
    type: string;
}[];
export declare const getParamsLength: (encodedParams: string) => string;
export declare const getParamsOffset: () => string;
export declare const getValidatorFunctionData: (validator: Validator, params: any[]) => {
    name: string;
    type: string;
}[];
export declare const getValidatorMethodInterface: (validator: Validator) => string;
export declare const getValidatorData: (call: Partial<MSCallInput>, noFunctionSignature: boolean) => string;
export declare const createValidatorTxData: (call: Partial<MSCallInput>) => object | Error;
