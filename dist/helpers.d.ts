import Web3 from "web3";
import Contract from "web3/eth/contract";
import { TypedData } from "ethers-eip712";
import { BatchCallBase, BatchFlags, MethodParamsInterface, MultiCallFlags, Params, Validator } from "./interfaces";
import { MultiSigCallInputInterface } from "./batchMultiSigCall/interfaces";
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
    OK_CONT_FAIL_JUMP: {
        text: string;
        value: string;
    };
    OK_REVERT_FAIL_CONT: {
        text: string;
        value: string;
    };
    OK_STOP_FAIL_CONT: {
        text: string;
        value: string;
    };
    OK_JUMP_FAIL_CONT: {
        text: string;
        value: string;
    };
};
export declare const getTypesArray: (params: Params[]) => any[];
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
export declare const getTypedDataDomain: (web3: Web3, factoryProxy: Contract, factoryProxyAddress: string) => Promise<{
    name: any;
    version: any;
    chainId: number;
    verifyingContract: string;
    salt: any;
}>;
export declare const getEncodedMethodParams: (call: Partial<MethodParamsInterface>, withFunction?: boolean) => string;
export declare const generateTxType: (item: Partial<MethodParamsInterface>) => any[];
export declare const getParamsLength: (encodedParams: string) => string;
export declare const getParamsOffset: () => string;
export declare const getFactoryProxyContract: (web3: Web3, proxyContractAddress: string) => import("web3-eth-contract").Contract;
export declare const getTransaction: (web3: Web3, address: string, method: string, params: any[]) => any;
export declare const getValidatorFunctionData: (validator: Validator, params: any[]) => any[];
export declare const getValidatorMethodInterface: (validator: Validator) => string;
export declare const getValidatorData: (call: Partial<MultiSigCallInputInterface>, noFunctionSignature: boolean) => string;
export declare const createValidatorTxData: (call: Partial<MultiSigCallInputInterface>) => {
    contractAddress: string;
    functionSignature: string;
    method_data_offset: string;
    method_data_length: string;
};
