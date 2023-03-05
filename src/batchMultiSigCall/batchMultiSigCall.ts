import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";
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

export class BatchMultiSigCall {
  protected FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  protected FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);

  public batchMultiSigSelector = "0xf6407ddd";
  public version = "0x010101";
  public chainId: ChainId;
  public domain: TypedDataDomain;
  public randomId = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

  // Utils
  public utils = new FCTUtils(this);
  public _variables = new Variables(this);
  protected _options = new Options();
  protected _calls = new FCTCalls(this, {
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
      this.domain = EIP712.getTypedDataDomain(this.chainId);
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

  get computed() {
    return this._variables.computed;
  }

  get computedWithValues() {
    return this._variables.computedWithValues;
  }

  // Setters
  public setOptions = (options: DeepPartial<IFCTOptions>): IFCTOptions => {
    return this._options.set(options);
  };

  public setCallDefaults = (callDefault: DeepPartial<ICallDefaults>) => {
    return this._calls.setCallDefaults(callDefault);
  };

  // Variables
  public addComputed = (computed: IComputed) => {
    return this._variables.addComputed(computed);
  };

  // Plugin functions
  public getPlugin = getPlugin;
  public getPluginClass = getPluginClass;
  public getPluginData = getPluginData;
  public createPlugin = createPlugin;

  // FCT Functions
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
