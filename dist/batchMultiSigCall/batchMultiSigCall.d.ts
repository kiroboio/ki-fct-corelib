import { ethers } from "ethers";
import { create, createMultiple, exportFCT, getCall, importEncodedFCT, importFCT } from "./methods/FCT";
import { createTypedData, getAllRequiredApprovals, getParamsFromCall, handleTo, handleValue, setOptions, verifyParams } from "./methods/helpers";
import { getPlugin, getPluginClass } from "./methods/plugins";
import { getComputedVariable, getExternalVariable, getOutputVariable, getVariable } from "./methods/variables";
import { ComputedVariables, IFCTOptions, IMSCallInput } from "./types";
import { getPluginData } from "./utils";
export type ChainId = "1" | "5";
interface BatchMultiSigCallConstructor {
    chainId?: ChainId;
    options?: Partial<IFCTOptions>;
}
export declare class BatchMultiSigCall {
    protected FCT_Controller: ethers.utils.Interface;
    protected FCT_BatchMultiSigCall: ethers.utils.Interface;
    protected batchMultiSigSelector: string;
    protected chainId: ChainId;
    protected computedVariables: ComputedVariables[];
    calls: IMSCallInput[];
    options: IFCTOptions;
    constructor(input?: BatchMultiSigCallConstructor);
    getAllRequiredApprovals: typeof getAllRequiredApprovals;
    protected getVariable: typeof getVariable;
    protected getOutputVariable: typeof getOutputVariable;
    protected getExternalVariable: typeof getExternalVariable;
    protected getComputedVariable: typeof getComputedVariable;
    setOptions: typeof setOptions;
    getPlugin: typeof getPlugin;
    getPluginClass: typeof getPluginClass;
    create: typeof create;
    createMultiple: typeof createMultiple;
    exportFCT: typeof exportFCT;
    importFCT: typeof importFCT;
    importEncodedFCT: typeof importEncodedFCT;
    getCall: typeof getCall;
    get length(): number;
    protected createTypedData: typeof createTypedData;
    protected getParamsFromCall: typeof getParamsFromCall;
    protected verifyParams: typeof verifyParams;
    protected handleTo: typeof handleTo;
    protected handleValue: typeof handleValue;
    getPluginData: typeof getPluginData;
}
export {};
