import { ethers } from "ethers";
import { PluginInstance } from "@kirobo/ki-eth-fct-provider-ts";
import { IMSCallInput, MSCallOptions, IWithPlugin, IBatchMultiSigCallFCT } from "./interfaces";
export declare class BatchMultiSigCall {
    private FCT_Controller;
    private FCT_BatchMultiSigCall;
    private batchMultiSigSelector;
    private provider;
    private chainId;
    calls: IMSCallInput[];
    options: MSCallOptions;
    constructor({ provider, contractAddress, options, chainId, }: {
        provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
        contractAddress?: string;
        options?: Partial<MSCallOptions>;
        chainId?: number;
    });
    getCalldataForActuator: ({ signedFCT, purgedFCT, investor, activator, version, }: {
        signedFCT: object;
        purgedFCT: string;
        investor: string;
        activator: string;
        version: string;
    }) => Promise<string>;
    getAllRequiredApprovals: () => Promise<{
        amount: string;
        to: string | undefined;
        spender: string | undefined;
        from: string;
    }[]>;
    private getVariable;
    private getOutputVariable;
    private getExternalVariable;
    setOptions(options: Partial<MSCallOptions>): MSCallOptions;
    getPlugin: (index: number) => Promise<PluginInstance>;
    getPluginClass: (index: number) => Promise<any>;
    create(callInput: IMSCallInput | IWithPlugin): Promise<IMSCallInput[]>;
    createMultiple(calls: (IMSCallInput | IWithPlugin)[]): Promise<IMSCallInput[]>;
    getCall(index: number): IMSCallInput;
    get length(): number;
    exportFCT(): Promise<IBatchMultiSigCallFCT>;
    importFCT(fct: IBatchMultiSigCallFCT): IMSCallInput[];
    private createTypedData;
    private getParamsFromCall;
    private verifyParams;
    private handleTo;
    private handleValue;
}
