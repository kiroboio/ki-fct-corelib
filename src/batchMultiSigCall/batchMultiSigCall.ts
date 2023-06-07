import { ChainId } from "@kiroboio/fct-plugins";

import { DeepPartial } from "../types";
import { EIP712, FCTCalls, FCTUtils, Options, Variables } from "./classes";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import {
  create,
  createMultiple,
  createPlugin,
  exportFCT,
  getCall,
  getPlugin,
  getPluginClass,
  getPluginData,
  importEncodedFCT,
  importFCT,
} from "./methods";
import {
  BatchMultiSigCallConstructor,
  ComputedVariable,
  DecodedCalls,
  IBatchMultiSigCallFCT,
  ICallDefaults,
  IComputed,
  IFCTOptions,
  RequiredFCTOptions,
  StrictMSCallInput,
  TypedDataDomain,
} from "./types";
import * as utils from "./utils";
import Deep = Chai.Deep;

export class BatchMultiSigCall {
  public batchMultiSigSelector = "0xf6407ddd";
  public version = "0x010101";
  public chainId: ChainId;
  public domain: TypedDataDomain;
  public randomId = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

  // Utils
  public utils = new FCTUtils(this);
  public variables = new Variables(this);
  protected _options = new Options();
  public _calls = new FCTCalls(this, {
    value: "0",
    options: DEFAULT_CALL_OPTIONS,
  });

  constructor(input: BatchMultiSigCallConstructor = {}) {
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
    return this._calls.get();
  }

  get decodedCalls(): DecodedCalls[] {
    return this._calls.getWithDecodedVariables();
  }

  get computed(): IComputed[] {
    return this.variables.computed;
  }

  get computedWithValues(): ComputedVariable[] {
    return this.variables.computedWithValues;
  }

  // Setters
  public setOptions<O extends DeepPartial<IFCTOptions>>(options: O) {
    return this._options.set(options);
  }

  public setCallDefaults<C extends DeepPartial<ICallDefaults>>(callDefault: C) {
    return this._calls.setCallDefaults(callDefault);
  }

  public changeChainId = (chainId: ChainId) => {
    this.chainId = chainId;
    const domain = EIP712.getTypedDataDomain(this.chainId);
    if (!domain) throw new Error(`ChainId ${this.chainId} is not supported. Please provide a custom EIP712 domain.`);
    this.domain = domain;
  };

  // Variables
  public addComputed = (computed: IComputed) => {
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

  // Static functions
  static utils = utils;
  static from = (input: IBatchMultiSigCallFCT) => {
    const batchMultiSigCall = new BatchMultiSigCall();
    batchMultiSigCall.importFCT(input);
    return batchMultiSigCall;
  };
}
