import { PluginInstance } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";
import { IBatchMultiSigCallFCT, IFCTOptions, IMSCallInput, IWithPlugin } from "./types";
export declare class BatchMultiSigCall {
    private FCT_Controller;
    private FCT_BatchMultiSigCall;
    private batchMultiSigSelector;
    private provider;
    private chainId;
    private computedVariables;
    calls: IMSCallInput[];
    options: IFCTOptions;
    constructor({ provider, contractAddress, options, chainId, }: {
        provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
        contractAddress?: string;
        options?: Partial<IFCTOptions>;
        chainId?: number;
    });
    getCalldataForActuator: ({ signedFCT, purgedFCT, investor, activator, version, }: {
        signedFCT: object;
        purgedFCT: string;
        investor: string;
        activator: string;
        version: string;
    }) => string;
    getAllRequiredApprovals: () => Promise<{
        requiredAmount: string;
        token: string;
        spender: string;
        from: string;
    }[]>;
    private getVariable;
    private getOutputVariable;
    private getExternalVariable;
    private getComputedVariable;
    setOptions(options: Partial<IFCTOptions>): IFCTOptions;
    getPlugin: (index: number) => Promise<PluginInstance>;
    getPluginClass: (index: number) => Promise<any>;
    create(callInput: IMSCallInput | IWithPlugin): Promise<IMSCallInput[]>;
    createMultiple(calls: (IMSCallInput | IWithPlugin)[]): Promise<IMSCallInput[]>;
    getCall(index: number): IMSCallInput;
    get length(): number;
    exportFCT(): Promise<IBatchMultiSigCallFCT>;
    importFCT(fct: IBatchMultiSigCallFCT): IMSCallInput[];
    importEncodedFCT(calldata: string): Promise<IMSCallInput[]>;
    private createTypedData;
    private getParamsFromCall;
    private verifyParams;
    private handleTo;
    private handleValue;
}
