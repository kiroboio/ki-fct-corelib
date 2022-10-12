import { ethers } from "ethers";
import { TypedData } from "ethers-eip712";
import { MSCallInput, MSCall, MSCallOptions, IWithPlugin, IBatchMultiSigCallFCT } from "./interfaces";
import { Plugin } from "@kirobo/ki-eth-fct-provider-ts";
export declare class BatchMultiSigCall {
    private FCT_Controller;
    private FCT_BatchMultiSigCall;
    private batchMultiSigSelector;
    private provider;
    options: MSCallOptions;
    variables: string[][];
    calls: MSCallInput[];
    constructor({ provider, contractAddress, web3Provider, options, }: {
        provider?: ethers.providers.JsonRpcProvider;
        web3Provider?: ethers.providers.ExternalProvider | ethers.providers.JsonRpcFetchFunc;
        contractAddress: string;
        options?: Partial<MSCallOptions>;
    });
    getCalldataForActuator: (actuatorAddress: string, signedFCT: object, purgedFCT: string) => Promise<string>;
    private getVariable;
    private getOutputVariable;
    private getExternalVariable;
    getVariablesAsBytes32(): string[];
    setOptions(options: Partial<MSCallOptions>): MSCallOptions;
    getPlugin: (dataOrIndex: MSCall | number) => Promise<any>;
    getPluginClass: (index: number) => Promise<any>;
    getAllPlugins: () => {
        name: string;
        description?: string;
        plugin: Plugin;
    }[];
    create(callInput: MSCallInput | IWithPlugin): Promise<MSCallInput[]>;
    createMultiple(calls: (MSCallInput | IWithPlugin)[]): Promise<MSCallInput[]>;
    getCall(index: number): MSCallInput;
    get length(): number;
    exportFCT(): Promise<{
        typedData: TypedData;
        typeHash: string;
        builder: string;
        sessionId: string;
        nameHash: string;
        mcall: MSCall[];
    }>;
    importFCT(fct: IBatchMultiSigCallFCT): Promise<MSCallInput[] | Error>;
    private createTypedData;
    private getParams;
    private verifyParams;
    private handleTo;
    private handleValue;
}
