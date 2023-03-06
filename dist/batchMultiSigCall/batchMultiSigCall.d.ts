import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";
import { DeepPartial } from "../types";
import { FCTCalls, FCTUtils, Options, Variables } from "./classes";
import { create, createMultiple, createPlugin, exportFCT, getCall, getPlugin, getPluginClass, getPluginData, importEncodedFCT, importFCT } from "./methods";
import { BatchMultiSigCallConstructor, ComputedVariable, DecodedCalls, IBatchMultiSigCallFCT, ICallDefaults, IComputed, IFCTOptions, RequiredFCTOptions, StrictMSCallInput, TypedDataDomain } from "./types";
import * as utils from "./utils";
export declare class BatchMultiSigCall {
    protected FCT_Controller: ethers.utils.Interface;
    protected FCT_BatchMultiSigCall: ethers.utils.Interface;
    batchMultiSigSelector: string;
    version: string;
    chainId: ChainId;
    domain: TypedDataDomain;
    randomId: string;
    utils: FCTUtils;
    _variables: Variables;
    protected _options: Options;
    protected _calls: FCTCalls;
    constructor(input?: BatchMultiSigCallConstructor);
    get options(): RequiredFCTOptions;
    get calls(): StrictMSCallInput[];
    get decodedCalls(): DecodedCalls[];
    get computed(): IComputed[];
    get computedWithValues(): ComputedVariable[];
    setOptions: (options: DeepPartial<IFCTOptions>) => IFCTOptions;
    setCallDefaults: (callDefault: DeepPartial<ICallDefaults>) => ICallDefaults;
    addComputed: (computed: IComputed) => {
        type: "computed";
        id: string;
    } & {
        type: "computed";
    };
    getPlugin: typeof getPlugin;
    getPluginClass: typeof getPluginClass;
    getPluginData: typeof getPluginData;
    createPlugin: typeof createPlugin;
    create: typeof create;
    createMultiple: typeof createMultiple;
    exportFCT: typeof exportFCT;
    importFCT: typeof importFCT;
    importEncodedFCT: typeof importEncodedFCT;
    getCall: typeof getCall;
    static utils: typeof utils;
    static from: (input: IBatchMultiSigCallFCT) => BatchMultiSigCall;
}
