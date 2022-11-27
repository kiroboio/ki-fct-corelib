import { ethers } from "ethers";
import { MessageTypeProperty, TypedMessage } from "@metamask/eth-sig-util";
import { BatchCallBase, BatchFlags, MethodParamsInterface, MultiCallFlags, Params, Validator } from "./interfaces";
import { IMSCallInput, TypedDataDomain } from "./batchMultiSigCall/interfaces";
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
    OK_STOP_FAIL_STOP: {
        text: string;
        value: string;
    };
};
export declare const getTypesArray: (params: Params[]) => number[];
export declare const getTypedHashes: (params: Params[], typedData: TypedMessage<Record<"EIP712Domain" & string, MessageTypeProperty[]>>) => string[];
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
export declare const getTypeHash: (typedData: TypedMessage<Record<"EIP712Domain" & string, MessageTypeProperty[]>>) => string;
export declare const getTypedDataDomain: (factoryProxy: ethers.Contract) => Promise<TypedDataDomain>;
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
export declare const getValidatorData: (call: Partial<IMSCallInput>, noFunctionSignature: boolean) => string;
export declare const createValidatorTxData: (call: Partial<IMSCallInput>) => object | Error;
