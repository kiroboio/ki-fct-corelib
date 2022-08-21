import { ethers } from "ethers";
import { TypedData } from "ethers-eip712";
import { MSCallInput, MSCall, MSCallOptions } from "./interfaces";
export declare class BatchMultiSigCallNew {
    private FactoryProxy;
    options: MSCallOptions;
    variables: string[][];
    inputCalls: MSCallInput[];
    constructor(provider: ethers.providers.JsonRpcProvider, contractAddress: string);
    createVariable(variableId: string, value?: string): string[];
    private getVariableIndex;
    private getVariableFCValue;
    getCallValue(index: number, bytes?: boolean): string;
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
