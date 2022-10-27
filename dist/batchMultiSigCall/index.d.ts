import { ethers } from "ethers";
import { IMSCallInput, MSCallOptions, IWithPlugin, IBatchMultiSigCallFCT } from "./interfaces";
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
    create(callInput: IMSCallInput | IWithPlugin): Promise<IMSCallInput[]>;
    createMultiple(calls: (IMSCallInput | IWithPlugin)[]): Promise<IMSCallInput[]>;
    getCall(index: number): IMSCallInput;
    get length(): number;
    exportFCT(): Promise<IBatchMultiSigCallFCT>;
    importFCT(fct: IBatchMultiSigCallFCT): Promise<IMSCallInput[] | Error>;
    private createTypedData;
    private getParams;
    private verifyParams;
    private handleTo;
    private handleValue;
}
