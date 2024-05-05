import { ChainId } from "@kiroboio/fct-plugins";

import { deepMerge } from "../helpers/deepMerge";
import { DeepPartial, FCTCall, IFCT, StrictMSCallInput } from "../types";
import { FCTCache } from "./cache";
import { EIP712, FCTUtils, Options, Validation, Variables } from "./classes";
import { IValidation } from "./classes/Validation/types";
import { IComputed, IComputedData } from "./classes/Variables/types";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import {
  addAtIndex,
  create,
  createMultiple,
  createPlugin,
  exportEfficientFCT,
  exportFCT,
  exportMap,
  exportNotificationFCT,
  exportWithApprovals,
  exportWithPayment,
  getCall,
  getCallByNodeId,
  getIndexByNodeId,
  getPlugin,
  getPluginClass,
  getPluginData,
  importFCT,
  importFCTWithMap,
} from "./methods";
import {
  BatchMultiSigCallConstructor,
  DecodedCalls,
  ICallDefaults,
  IFCTOptions,
  RequiredFCTOptions,
  TypedDataDomain,
} from "./types";
import * as utils from "./utils";

export class BatchMultiSigCall {
  public batchMultiSigSelector = "0x7d971612";
  public version = "0x020101";
  public chainId: ChainId;
  public domain: TypedDataDomain;
  public randomId = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

  // Utils
  public utils: FCTUtils;
  public variables: Variables;
  public validation: Validation;

  protected _options: Options;
  protected _calls: FCTCall[] = [];
  protected _callDefault: ICallDefaults = {
    value: "0",
    options: DEFAULT_CALL_OPTIONS,
  };

  constructor(input: BatchMultiSigCallConstructor = {}) {
    this.utils = new FCTUtils(this);
    this.variables = new Variables(this);
    this.validation = new Validation(this);
    this._options = new Options();

    if (input.chainId) {
      if (typeof input.chainId === "number") {
        this.chainId = input.chainId.toString() as ChainId;
      } else {
        this.chainId = input.chainId;
      }
    } else {
      this.chainId = "1";
    }
    if (input.domain) {
      this.domain = input.domain;
    } else {
      const domain = EIP712.getTypedDataDomain(this.chainId);
      if (!domain) throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
      this.domain = domain;
    }

    if (input.version) this.version = input.version;
    if (input.options) this.setOptions(input.options);
    if (input.defaults) this.setCallDefaults(input.defaults);
  }

  // Getters
  get options(): RequiredFCTOptions {
    return this._options.get();
  }

  get calls(): FCTCall[] {
    return this._calls;
  }

  get callsAsObjects(): StrictMSCallInput[] {
    return this._calls.map((call) => call.get());
  }

  get decodedCalls(): DecodedCalls[] {
    return this._calls.map((call) => call.getDecoded());
  }

  get callDefault(): ICallDefaults {
    return this._callDefault;
  }

  get computed(): IComputed[] {
    return this.variables.computed;
  }

  get computedAsData(): IComputedData[] {
    return this.variables.computedAsData;
  }

  get validations() {
    return this.validation.get();
  }

  // Setters
  /**
   * Set the options for the FCT.
   */
  public setOptions<O extends DeepPartial<IFCTOptions>>(options: O) {
    return this._options.set(options) as RequiredFCTOptions & O;
  }

  public setCallDefaults<C extends DeepPartial<ICallDefaults>>(callDefault: C) {
    this._callDefault = deepMerge(this._callDefault, callDefault);
    return this._callDefault as ICallDefaults & C;
  }

  public changeChainId = (chainId: ChainId) => {
    this.chainId = chainId;
    const domain = EIP712.getTypedDataDomain(this.chainId);
    if (!domain) throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
    this.domain = domain;
  };

  // Variables
  public addComputed = <C extends Partial<IComputed>>(computed: C) => {
    return this.variables.addComputed<C>(computed);
  };

  public addValidation = <V extends IValidation<true>>(validation: { nodeId: string; validation: V }) => {
    return this.validation.add<V>(validation);
  };

  // Plugin functions
  getPlugin = getPlugin;
  getPluginClass = getPluginClass;
  getPluginData = getPluginData;
  createPlugin = createPlugin;

  // Add calls to FCT
  /**
   * This function adds a new Call instance and adds it to the _calls array.
   * If the input is already a Call instance, it is directly added to the _calls array.
   * Otherwise, a new Call instance is created from the input and then added to the _calls array.
   *
   * @param {FCTInputCall} call - The input call to create a Call instance from.
   * @returns {Promise<Call>} The created Call instance.
   */
  add = create;
  /**
   * This function adds multiple new Call instances and adds them to the _calls array.
   * If the input is already a Call instance, it is directly added to the _calls array.
   * Otherwise, a new Call instance is created from the input and then added to the _calls array.
   *
   * @param {FCTInputCall[]} calls - The input calls to create Call instances from.
   * @returns {Promise<Call[]>} The created Call instances.
   */
  addMultiple = createMultiple;
  // * @deprecated Please use `add` instead.
  /**
   * This function adds a new Call instance and adds it to the _calls array.
   * If the input is already a Call instance, it is directly added to the _calls array.
   * Otherwise, a new Call instance is created from the input and then added to the _calls array.
   *
   * @param {FCTInputCall} call - The input call to create a Call instance from.
   * @returns {Promise<Call>} The created Call instance.
   */
  create = create;
  //  * @deprecated Please use `addMultiple` instead.
  /**
   * This function adds multiple new Call instances and adds them to the _calls array.
   * If the input is already a Call instance, it is directly added to the _calls array.
   * Otherwise, a new Call instance is created from the input and then added to the _calls array.
   *
   * @param {FCTInputCall[]} calls - The input calls to create Call instances from.
   * @returns {Promise<Call[]>} The created Call instances.
   */
  createMultiple = createMultiple;
  // Specific to BatchMultiSigCall
  protected addAtIndex = addAtIndex;

  // Export FCT
  export = exportFCT;
  exportFCT = exportFCT;
  exportNotification = exportNotificationFCT;
  exportNotificationFCT = exportNotificationFCT;
  exportWithApprovals = exportWithApprovals;
  exportWithPayment = exportWithPayment;

  // Export minimal FCT
  exportEfficientFCT = exportEfficientFCT;

  // Export mapping
  exportMap = exportMap;

  // Import FCT
  importFCT = importFCT;
  importFCTWithMap = importFCTWithMap;

  // FCT Call getters
  getCall = getCall;
  getCallByNodeId = getCallByNodeId;
  getIndexByNodeId = getIndexByNodeId;

  protected _setOptionsWithoutValidation(options: DeepPartial<IFCTOptions>) {
    return this._options.set(options, false) as RequiredFCTOptions;
  }

  // Static functions
  static utils = utils;

  static from = (input: IFCT, messageHash?: string) => {
    if (messageHash) {
      const cached = FCTCache.get<BatchMultiSigCall>(messageHash.toLowerCase());
      if (cached) return cached;
    }

    const FCT = new BatchMultiSigCall();
    FCT.importFCT(input);
    if (messageHash) FCTCache.set(messageHash.toLowerCase(), FCT);
    return FCT;
  };

  static fromMap = (input: IFCT, map: ReturnType<BatchMultiSigCall["exportMap"]>, messageHash?: string) => {
    if (messageHash) {
      const cached = FCTCache.get<BatchMultiSigCall>(messageHash.toLowerCase());
      if (cached) return cached;
    }

    const FCT = new BatchMultiSigCall();
    FCT.importFCTWithMap(input, map);
    if (messageHash) FCTCache.set(messageHash.toLowerCase(), FCT);
    return FCT;
  };

  static getTransacitonTrace = async ({
    fct,
    map,
    txHash,
    tenderlyRpcUrl,
  }: {
    fct: IFCT;
    map: ReturnType<BatchMultiSigCall["exportMap"]>;
    txHash: string;
    tenderlyRpcUrl: string;
  }) => {
    const FCT = BatchMultiSigCall.fromMap(fct, map);
    return await FCT.utils.getTransactionTrace({ txHash, tenderlyRpcUrl });
  };
}
