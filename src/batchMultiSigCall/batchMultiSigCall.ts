import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";
import { instanceOfVariable } from "../helpers";
import { DeepPartial, Variable } from "../types";
import { EIP712, FCTCalls, Options } from "./classes";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import {
  addComputed,
  create,
  createMultiple,
  createPlugin,
  decodeParams,
  exportFCT,
  getAllRequiredApprovals,
  getCall,
  getComputedVariable,
  getExternalVariable,
  getOutputVariable,
  getPlugin,
  getPluginClass,
  getPluginData,
  getVariable,
  handleVariableValue,
  importEncodedFCT,
  importFCT,
} from "./methods";
import {
  BatchMultiSigCallConstructor,
  ComputedVariable,
  DecodedCalls,
  ICallDefaults,
  IComputed,
  IFCTOptions,
  RequiredFCTOptions,
  StrictMSCallInput,
  TypedDataDomain,
} from "./types";
import * as utils from "./utils";

export class BatchMultiSigCall {
  public FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  public FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
  public batchMultiSigSelector = "0xf6407ddd";
  public version = "0x010101";
  public chainId: ChainId;
  public domain: TypedDataDomain;
  public randomId = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

  public _computed: Required<IComputed>[] = [];
  public _calls: FCTCalls;
  public _options = new Options();

  constructor(input: BatchMultiSigCallConstructor = {}) {
    if (input.chainId) {
      this.chainId = input.chainId;
    } else {
      this.chainId = "5"; // For now we default to Goerli. TODO: Change this to mainnet
    }
    if (input.domain) {
      this.domain = input.domain;
    } else {
      this.domain = EIP712.getTypedDataDomain(this.chainId);
    }

    if (input.version) this.version = input.version;
    if (input.options) this.setOptions(input.options);
    if (input.defaults) this.setCallDefaults(input.defaults);

    this._calls = new FCTCalls(this, {
      value: "0",
      options: DEFAULT_CALL_OPTIONS,
    });
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
    return this._computed;
  }

  get convertedComputed(): ComputedVariable[] {
    const handleVariable = (value: string | Variable) => {
      if (instanceOfVariable(value)) {
        return this.getVariable(value, "uint256");
      }
      return value;
    };
    return this._computed.map((c, i) => ({
      index: (i + 1).toString(),
      value: handleVariable(c.value),
      add: handleVariable(c.add),
      sub: handleVariable(c.sub),
      mul: handleVariable(c.mul),
      pow: handleVariable(c.pow),
      div: handleVariable(c.div),
      mod: handleVariable(c.mod),
    }));
  }

  // Set methods
  public setOptions = (options: DeepPartial<IFCTOptions>): IFCTOptions => {
    return this._options.set(options);
  };
  public setCallDefaults = (callDefault: DeepPartial<ICallDefaults>) => {
    return this._calls.setCallDefaults(callDefault);
  };

  // Add Computed
  public addComputed = addComputed;

  // Plugin functions
  public getPlugin = getPlugin;
  public getPluginClass = getPluginClass;
  public createPlugin = createPlugin;

  // FCT Functions
  public create = create;
  public createMultiple = createMultiple;
  public exportFCT = exportFCT;
  public importFCT = importFCT;
  public importEncodedFCT = importEncodedFCT;
  public getCall = getCall;

  // Utility functions
  public getPluginData = getPluginData;
  public getAllRequiredApprovals = getAllRequiredApprovals;

  // Variables
  public getVariable = getVariable;
  public getOutputVariable = getOutputVariable;
  public getExternalVariable = getExternalVariable;
  public getComputedVariable = getComputedVariable;

  // Internal helper functions
  public decodeParams = decodeParams;
  public handleVariableValue = handleVariableValue;

  // Static methods
  static utils = utils;
}
