import { ethers } from "ethers";
import { TypedData } from "ethers-eip712";
import { IMSCallInput, MSCall, MSCallOptions, IWithPlugin, IBatchMultiSigCallFCT } from "./interfaces";
import { Plugin } from "@kirobo/ki-eth-fct-provider-ts";
export declare class BatchMultiSigCall {
    private FCT_Controller;
    private FCT_BatchMultiSigCall;
    private batchMultiSigSelector;
    private provider;
    calls: IMSCallInput[];
    options: MSCallOptions;
    constructor({ provider, contractAddress, options, }: {
        provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
        contractAddress: string;
        options?: Partial<MSCallOptions>;
    });
    getCalldataForActuator: (actuatorAddress: string, signedFCT: object, purgedFCT: string) => Promise<string>;
    private getVariable;
    private getOutputVariable;
    private getExternalVariable;
    setOptions(options: Partial<MSCallOptions>): MSCallOptions;
    getPlugin: (dataOrIndex: MSCall | number) => Promise<any>;
    getPluginClass: (index: number) => Promise<any>;
    getAllPlugins: () => {
        name: string;
        description?: string;
        plugin: Plugin;
    }[];
    create(callInput: IMSCallInput | IWithPlugin): Promise<IMSCallInput[]>;
    createMultiple(calls: (IMSCallInput | IWithPlugin)[]): Promise<IMSCallInput[]>;
    getCall(index: number): IMSCallInput;
    get length(): number;
    exportFCT(): Promise<{
        typedData: TypedData;
        typeHash: string;
        builder: string;
        sessionId: string;
        nameHash: string;
        mcall: MSCall[];
    }>;
    importFCT(fct: IBatchMultiSigCallFCT): Promise<IMSCallInput[] | Error>;
    private createTypedData;
    private getParams;
    private verifyParams;
    private handleTo;
    private handleValue;
}
