import { ChainId } from "@kiroboio/fct-plugins";
import _ from "lodash";

import { DeepPartial, FCTCall, IFCT, StrictMSCallInput } from "../types";
import { EIP712, FCTUtils, Options, Validation, Variables } from "./classes";
import { IComputed, IComputedData } from "./classes/Variables/types";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import {
  create,
  createMultiple,
  createPlugin,
  exportFCT,
  getCall,
  getCallByNodeId,
  getPlugin,
  getPluginClass,
  getPluginData,
  importEncodedFCT,
  importFCT,
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
  public batchMultiSigSelector = "0xa585028b";
  public version = "0x010101";
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
      this.chainId = input.chainId;
    } else {
      this.chainId = "5"; // @todo This should be changed to mainnet in the future. For now we use Goerli
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

  get calls(): StrictMSCallInput[] {
    return this._calls.map((call) => call.get);
  }

  get pureCalls(): FCTCall[] {
    return this._calls;
  }

  get decodedCalls(): DecodedCalls[] {
    return this._calls.map((call) => call.getDecoded);
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
    return this.validation.get;
  }

  public getSpecificCallDefault = (index: number) => {
    return _.merge({}, this._callDefault, { options: { payerIndex: index + 1 } });
  };

  // Setters
  public setOptions(options: DeepPartial<IFCTOptions>) {
    return this._options.set(options);
  }

  public setCallDefaults<C extends DeepPartial<ICallDefaults>>(callDefault: C) {
    this._callDefault = _.merge({}, this._callDefault, callDefault);
    return this._callDefault as ICallDefaults & C;
  }

  public changeChainId = (chainId: ChainId) => {
    this.chainId = chainId;
    const domain = EIP712.getTypedDataDomain(this.chainId);
    if (!domain) throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
    this.domain = domain;
  };

  public changeVersion = (version: string) => {
    // Make sure that the version is a hex string and is 6 bytes long
    if (!/^0x([0-9a-fA-F]{2}){3}$/.test(version)) throw new Error("Version must be a hex string and 6 bytes long");
    this.version = version;
    return this.version;
  };

  // Variables
  public addComputed = (computed: Partial<IComputed>) => {
    return this.variables.addComputed(computed);
  };

  // Plugin functions
  public getPlugin = getPlugin;
  public getPluginClass = getPluginClass;
  public getPluginData = getPluginData;
  public createPlugin = createPlugin;

  // FCT Functions
  public add = create;
  public addMultiple = createMultiple;
  public create = create;
  public createMultiple = createMultiple;
  public exportFCT = exportFCT;

  public importFCT = importFCT;
  public importEncodedFCT = importEncodedFCT;
  public getCall = getCall;
  public getCallByNodeId = getCallByNodeId;
  public getIndexByNodeId = (nodeId: string) => {
    return this._calls.findIndex((call) => call.nodeId === nodeId);
  };

  // Static functions
  static utils = utils;
  static from = (input: IFCT & { validations?: [] }) => {
    const batchMultiSigCall = new BatchMultiSigCall();
    batchMultiSigCall.importFCT(input);
    return batchMultiSigCall;
  };
}
