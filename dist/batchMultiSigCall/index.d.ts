import { ethers } from "ethers";
import { TypedData } from "ethers-eip712";
import { MSCallInput, MSCall, MSCallOptions, IWithPlugin } from "./interfaces";
import { Plugin, PluginInstance } from "@kirobo/ki-eth-fct-provider-ts";
export declare class BatchMultiSigCall {
    private FactoryProxy;
    options: MSCallOptions;
    variables: string[][];
    calls: MSCallInput[];
    constructor({ provider, contractAddress, options, }: {
        provider: ethers.providers.JsonRpcProvider;
        contractAddress: string;
        options?: MSCallOptions;
    });
    validate(call: MSCallInput): boolean;
    createVariable(variableId: string, value?: string): string[];
    private getVariableIndex;
    private getVariableFCValue;
    getCallValue(index: number, bytes?: boolean): string;
    setOptions(options: MSCallOptions): MSCallOptions;
    getPlugin: (dataOrIndex: MSCall | number) => PluginInstance | undefined;
    getAllPlugins: () => Plugin[];
    create(callInput: MSCallInput | IWithPlugin, index?: number): Promise<MSCallInput[]>;
    replaceCall(tx: MSCallInput, index: number): MSCallInput[];
    removeCall(index: number): MSCallInput[];
    getCall(index: number): MSCallInput;
    get length(): number;
    exportFCT(): Promise<{
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
