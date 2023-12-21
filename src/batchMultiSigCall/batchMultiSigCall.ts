import { ChainId } from "@kiroboio/fct-plugins";

import { deepMerge } from "../helpers/deepMerge";
import { DeepPartial, FCTCall, IFCT, StrictMSCallInput } from "../types";
import { EIP712, FCTUtils, Options, Validation, Variables } from "./classes";
import { IValidation } from "./classes/Validation/types";
import { IComputed, IComputedData } from "./classes/Variables/types";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import {
  addAtIndex,
  create,
  createMultiple,
  createPlugin,
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
  protected _batchMultiSigSelector = "0x7d971612";
  protected _version = "0x020101";
  protected _chainId: ChainId;
  protected _domain: TypedDataDomain;
  protected _randomId = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

  // TODO: Don't rely on child classes.
  // Instead of using the child classes (FCTUtils, Variables, Validation) directly,
  // we should use the parent class (BatchMultiSigCall) to access them.
  /*
   * _utils = {getTransactionTrace: () => {}...}
   *
   */

  public utils: FCTUtils;

  // TODO: There is absolutely no need for these to be public.
  // So for these it is a must them to be an object.
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
        this._chainId = input.chainId.toString() as ChainId;
      } else {
        this._chainId = input.chainId;
      }
    } else {
      this._chainId = "1";
    }
    if (input.domain) {
      this._domain = input.domain;
    } else {
      const domain = EIP712.getTypedDataDomain(this._chainId);
      if (!domain) throw new Error(`ChainId ${this._chainId} is not supported. Please provide a custom EIP712 domain.`);
      this._domain = domain;
    }

    if (input.version) this._version = input.version;
    if (input.options) this.setOptions(input.options);
    if (input.defaults) this.setCallDefaults(input.defaults);
  }
  //
  // Getters
  //
  // Stored values
  get batchMultiSigSelector() {
    return this._batchMultiSigSelector;
  }

  get version() {
    return this._version;
  }

  get chainId() {
    return this._chainId;
  }

  get domain() {
    return this._domain;
  }

  get randomId() {
    return this._randomId;
  }

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
  public setOptions<O extends DeepPartial<IFCTOptions>>(options: O) {
    return this._options.set(options) as RequiredFCTOptions & O;
  }

  public setCallDefaults<C extends DeepPartial<ICallDefaults>>(callDefault: C) {
    this._callDefault = deepMerge(this._callDefault, callDefault);
    return this._callDefault as ICallDefaults & C;
  }

  public changeChainId = (chainId: ChainId) => {
    this._chainId = chainId;
    const domain = EIP712.getTypedDataDomain(this.chainId);
    if (!domain) throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
    this._domain = domain;
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
  add = create;
  addMultiple = createMultiple;
  create = create;
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

  static from = (input: IFCT) => {
    const batchMultiSigCall = new BatchMultiSigCall();
    batchMultiSigCall.importFCT(input);
    return batchMultiSigCall;
  };

  static fromMap = (input: IFCT, map: ReturnType<BatchMultiSigCall["exportMap"]>) => {
    const batchMultiSigCall = new BatchMultiSigCall();
    batchMultiSigCall.importFCTWithMap(input, map);
    return batchMultiSigCall;
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
