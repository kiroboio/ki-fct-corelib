import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";
import { DeepPartial } from "../types";
import { EIP712, FCTCalls, FCTUtils, Options, Variables } from "./classes";
import { create, createMultiple, createPlugin, exportFCT, getCall, getPlugin, getPluginClass, getPluginData, importEncodedFCT, importFCT } from "./methods";
import { BatchMultiSigCallConstructor, DecodedCalls, IBatchMultiSigCallFCT, ICallDefaults, IComputed, IFCTOptions, RequiredFCTOptions, StrictMSCallInput, TypedDataDomain } from "./types";
import * as utils from "./utils";
export declare class BatchMultiSigCall {
    FCT_Controller: ethers.utils.Interface;
    FCT_BatchMultiSigCall: ethers.utils.Interface;
    batchMultiSigSelector: string;
    version: string;
    chainId: ChainId;
    domain: TypedDataDomain;
    randomId: string;
    utils: FCTUtils;
    _options: Options;
    _variables: Variables;
    _eip712: EIP712;
    _calls: FCTCalls;
    constructor(input?: BatchMultiSigCallConstructor);
    get options(): RequiredFCTOptions;
    get calls(): StrictMSCallInput[];
    get decodedCalls(): DecodedCalls[];
    get computed(): Required<IComputed>[];
    get computedWithValues(): {
        index: string;
        value: string;
        add: string;
        sub: string;
        mul: string;
        pow: string;
        div: string;
        mod: string;
    }[];
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
