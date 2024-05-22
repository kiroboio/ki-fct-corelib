import { ChainId } from "@kiroboio/fct-plugins";
import { DeepPartial, FCTCall, IFCT, StrictMSCallInput } from "../types";
import { FCTUtils, Options, Validation, Variables } from "./classes";
import { IValidation } from "./classes/Validation/types";
import { IComputed, IComputedData } from "./classes/Variables/types";
import { addAtIndex, create, createMultiple, createPlugin, exportEfficientFCT, exportFCT, exportMap, exportNotificationFCT, exportWithApprovals, exportWithPayment, getCall, getCallByNodeId, getIndexByNodeId, getPlugin, getPluginClass, getPluginData, importFCT, importFCTWithMap } from "./methods";
import { BatchMultiSigCallConstructor, DecodedCalls, ICallDefaults, IFCTOptions, RequiredFCTOptions, TypedDataDomain } from "./types";
import * as utils from "./utils";
export declare class BatchMultiSigCall {
    batchMultiSigSelector: string;
    version: string;
    chainId: ChainId;
    domain: TypedDataDomain;
    randomId: string;
    utils: FCTUtils;
    variables: Variables;
    validation: Validation;
    protected _options: Options;
    protected _calls: FCTCall[];
    protected _callDefault: ICallDefaults;
    constructor(input?: BatchMultiSigCallConstructor);
    get options(): RequiredFCTOptions;
    get calls(): FCTCall[];
    get callsAsObjects(): StrictMSCallInput[];
    get decodedCalls(): DecodedCalls[];
    get callDefault(): ICallDefaults;
    get computed(): IComputed[];
    get computedAsData(): IComputedData[];
    get validations(): Required<IValidation<false>>[];
    /**
     * Set the options for the FCT.
     */
    setOptions<O extends DeepPartial<IFCTOptions>>(options: O): {
        id: string;
        name: string;
        validFrom: string;
        expiresAt: string;
        maxGasPrice: string;
        payableGasLimitInKilo: string;
        blockable: boolean;
        purgeable: boolean;
        authEnabled: boolean;
        dryRun: boolean;
        verifier: string;
        domain: string;
        app: {
            name: string;
            version: string;
        };
        builder: {
            name: string;
            address: string;
        };
        recurrency: {
            maxRepeats: string;
            chillTime: string;
            accumetable: boolean;
        };
        multisig: {
            externalSigners: string[];
            minimumApprovals: string;
        };
    } & O;
    setCallDefaults<C extends DeepPartial<ICallDefaults>>(callDefault: C): Omit<import("../types").RequiredKeys<Partial<import("./types").MSCallBase>, "value">, "nodeId"> & {
        options: {
            validation: string;
            gasLimit: string;
            falseMeansFail: boolean;
            usePureMethod: boolean;
            permissions: string;
            flow: import("../constants").Flow;
            jumpOnSuccess: string;
            jumpOnFail: string;
            callType: "ACTION" | "VIEW_ONLY" | "LIBRARY" | "LIBRARY_VIEW_ONLY";
        };
    } & C;
    changeChainId: (chainId: ChainId) => void;
    addComputed: <C extends Partial<IComputed>>(computed: C) => import("./classes/Variables/types").AddComputedResult<C>;
    addValidation: <V extends IValidation<true>>(validation: {
        nodeId: string;
        validation: V;
    }) => import("./classes/Validation/types").ValidationAddResult<V>;
    getPlugin: typeof getPlugin;
    getPluginClass: typeof getPluginClass;
    getPluginData: typeof getPluginData;
    createPlugin: typeof createPlugin;
    /**
     * This function adds a new Call instance and adds it to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall} call - The input call to create a Call instance from.
     * @returns {Promise<Call>} The created Call instance.
     */
    add: typeof create;
    /**
     * This function adds multiple new Call instances and adds them to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall[]} calls - The input calls to create Call instances from.
     * @returns {Promise<Call[]>} The created Call instances.
     */
    addMultiple: typeof createMultiple;
    /**
     * This function adds a new Call instance and adds it to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall} call - The input call to create a Call instance from.
     * @returns {Promise<Call>} The created Call instance.
     */
    create: typeof create;
    /**
     * This function adds multiple new Call instances and adds them to the _calls array.
     * If the input is already a Call instance, it is directly added to the _calls array.
     * Otherwise, a new Call instance is created from the input and then added to the _calls array.
     *
     * @param {FCTInputCall[]} calls - The input calls to create Call instances from.
     * @returns {Promise<Call[]>} The created Call instances.
     */
    createMultiple: typeof createMultiple;
    protected addAtIndex: typeof addAtIndex;
    export: typeof exportFCT;
    exportFCT: typeof exportFCT;
    exportNotification: typeof exportNotificationFCT;
    exportNotificationFCT: typeof exportNotificationFCT;
    exportWithApprovals: typeof exportWithApprovals;
    exportWithPayment: typeof exportWithPayment;
    exportEfficientFCT: typeof exportEfficientFCT;
    exportMap: typeof exportMap;
    importFCT: typeof importFCT;
    importFCTWithMap: typeof importFCTWithMap;
    getCall: typeof getCall;
    getCallByNodeId: typeof getCallByNodeId;
    getIndexByNodeId: typeof getIndexByNodeId;
    protected _setOptionsWithoutValidation(options: DeepPartial<IFCTOptions>): {
        id: string;
        name: string;
        validFrom: string;
        expiresAt: string;
        maxGasPrice: string;
        payableGasLimitInKilo: string;
        blockable: boolean;
        purgeable: boolean;
        authEnabled: boolean;
        dryRun: boolean;
        verifier: string;
        domain: string;
        app: {
            name: string;
            version: string;
        };
        builder: {
            name: string;
            address: string;
        };
        recurrency: {
            maxRepeats: string;
            chillTime: string;
            accumetable: boolean;
        };
        multisig: {
            externalSigners: string[];
            minimumApprovals: string;
        };
    };
    static utils: typeof utils;
    static from: (input: IFCT, messageHash?: string) => BatchMultiSigCall;
    static fromMap: (input: IFCT, map: ReturnType<BatchMultiSigCall["exportMap"]>, messageHash?: string) => BatchMultiSigCall;
    static getTransacitonTrace: ({ fct, map, txHash, tenderlyRpcUrl, }: {
        fct: IFCT;
        map: ReturnType<BatchMultiSigCall["exportMap"]>;
        txHash: string;
        tenderlyRpcUrl: string;
    }) => Promise<import("./classes/FCTUtils/types").ITxTrace | undefined>;
}
//# sourceMappingURL=batchMultiSigCall.d.ts.map