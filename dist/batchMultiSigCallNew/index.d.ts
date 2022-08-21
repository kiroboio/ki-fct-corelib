import { ethers } from "ethers";
import { TypedData } from "ethers-eip712";
import { MSCallInput, MSCall } from "./interfaces";
export interface MSCallOptions {
    name?: string;
    validFrom?: number;
    expiresAt?: number;
    maxGasPrice?: number;
    cancelable?: boolean;
    recurrency?: {
        maxRepeats: number;
        chillTime: number;
        accumetable: boolean;
    };
    multisig?: {
        externalSigners: string[];
        minimumApprovals: number;
    };
    flags?: {
        chillMode?: boolean;
    };
}
export declare class BatchMultiSigCallNew {
    private FactoryProxy;
    options: MSCallOptions;
    variables: string[][];
    inputCalls: MSCallInput[];
    constructor(provider: ethers.providers.JsonRpcProvider, contractAddress: string);
    createVariable(variableId: string, value?: string): string[];
    private getVariableIndex;
    private getVariableFCValue;
    setOptions(options: MSCallOptions): MSCallOptions;
    addCall(tx: MSCallInput, index?: number): MSCallInput[] | Error;
    replaceCall(tx: MSCallInput, index: number): MSCallInput[];
    removeCall(index: number): MSCallInput[];
    getCall(index: number): MSCallInput;
    get length(): number;
    getFCT(): Promise<{
        typedData: TypedData;
        typeHash: string;
        sessionId: string;
        name: string;
        mcall: MSCall[];
    }>;
    private createTypedData;
    private getParams;
    private verifyParams;
    private handleTo;
}
