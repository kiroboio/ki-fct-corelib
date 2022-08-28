import { ethers } from "ethers";
import { TypedData } from "ethers-eip712";
import { CallOptions, Params } from "../interfaces";
import { MSCallInput, MSCall, MSCallOptions, Plugin } from "./interfaces";
export declare class BatchMultiSigCall {
    private FactoryProxy;
    options: MSCallOptions;
    variables: string[][];
    calls: MSCallInput[];
    constructor(provider: ethers.providers.JsonRpcProvider, contractAddress: string);
    validate(call: MSCallInput): boolean;
    createVariable(variableId: string, value?: string): string[];
    private getVariableIndex;
    private getVariableFCValue;
    getCallValue(index: number, bytes?: boolean): string;
    setOptions(options: MSCallOptions): MSCallOptions;
    create({ plugin, index, ...tx }: {
        plugin?: Plugin;
        index?: number;
        from: string;
        value?: string;
        to?: string;
        method?: string;
        params?: Params[];
        viewOnly?: boolean;
        options?: CallOptions;
    }): MSCallInput[];
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
