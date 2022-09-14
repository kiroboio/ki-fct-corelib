import { ethers } from "ethers";
import { TypedData } from "ethers-eip712";
import { MSCallInput, MSCall, MSCallOptions, IWithPlugin, IBatchMultiSigCallFCT } from "./interfaces";
import { Plugin } from "@kirobo/ki-eth-fct-provider-ts";
export declare class BatchMultiSigCall {
    private FCT_BatchMultiSigCall;
    private batchMultiSigSelector;
    options: MSCallOptions;
    variables: string[][];
    calls: MSCallInput[];
    constructor({ provider, contractAddress, options, }: {
        provider: ethers.providers.JsonRpcProvider;
        contractAddress: string;
        options?: MSCallOptions;
    });
    validate(call: MSCallInput): boolean;
    getCalldataForActivator: (actuatorAddress: string, signedFCTs: object, listOfPrugedFCTs?: string[]) => Promise<any>;
    createVariable(variableId: string, value?: string): string[];
    addVariableValue(variableId: string, value: string): string[];
    private getVariableIndex;
    getVariableValue(variableId: string): string;
    getCallValue(index: number, bytes?: boolean): string;
    getVariablesAsBytes32(): string[];
    setOptions(options: MSCallOptions): MSCallOptions;
    getPlugin: (dataOrIndex: MSCall | number) => Promise<{
        name: string;
        description: string;
        plugin: Plugin;
    }>;
    getAllPlugins: () => {
        name: string;
        description: string;
        plugin: Plugin;
    }[];
    create(callInput: MSCallInput | IWithPlugin, index?: number): Promise<MSCallInput[]>;
    replaceCall(callInput: MSCallInput | IWithPlugin, index: number): Promise<MSCallInput[]>;
    removeCall(index: number): MSCallInput[];
    getCall(index: number): MSCallInput;
    get length(): number;
    exportFCT(): Promise<{
        typedData: TypedData;
        typeHash: string;
        builder: string;
        sessionId: string;
        nameHash: string;
        mcall: MSCall[];
    } | Error>;
    importFCT(fct: IBatchMultiSigCallFCT): Promise<MSCallInput[] | Error>;
    private createTypedData;
    private getParams;
    private verifyParams;
    private handleTo;
}
