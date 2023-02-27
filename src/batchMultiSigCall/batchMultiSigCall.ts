import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";
import { instanceOfVariable } from "../helpers";
import { RequiredKeys, Variable } from "../types";
import { Options } from "./classes/Options/Options";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import { TYPED_DATA_DOMAIN } from "./helpers/fct";
import {
  _getCalls,
  _getDecodedCalls,
  create,
  createMultiple,
  createPlugin,
  createWithEncodedData,
  createWithPlugin,
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
  setCallDefaults,
  setOptions,
  verifyCall,
} from "./methods";
import { addComputed } from "./methods/computed";
import {
  BatchMultiSigCallConstructor,
  ComputedVariable,
  DecodedCalls,
  ICallDefaults,
  IComputed,
  IMSCallInput,
  RequiredFCTOptions,
  StrictMSCallInput,
  TypedDataDomain,
} from "./types";

export class BatchMultiSigCall {
  public FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  public FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
  public batchMultiSigSelector = "0xf6407ddd";
  public version = "0x010101";
  public chainId: ChainId;
  public domain: TypedDataDomain;

  protected _computed: Required<IComputed>[] = [];
  protected _calls: RequiredKeys<IMSCallInput, "nodeId">[] = [];

  public _options = new Options();

  protected _callDefault: ICallDefaults = {
    value: "0",
    options: DEFAULT_CALL_OPTIONS,
  };

  constructor(input: BatchMultiSigCallConstructor = {}) {
    if (input.chainId) {
      this.chainId = input.chainId;
    } else {
      this.chainId = "5"; // For now we default to Goerli. TODO: Change this to mainnet
    }
    if (input.domain) {
      this.domain = input.domain;
    } else {
      this.domain = TYPED_DATA_DOMAIN[this.chainId];
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
    return this._getCalls();
  }

  get decodedCalls(): DecodedCalls[] {
    return this._getDecodedCalls();
  }

  get computedVariables() {
    return [];
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
  public setOptions = setOptions;
  public setCallDefaults = setCallDefaults;

  // Add Computed
  public addComputed = addComputed;

  // Plugin functions
  public getPlugin = getPlugin;
  public getPluginClass = getPluginClass;
  public createPlugin = createPlugin;

  // FCT Functions
  public create = create;
  public createWithEncodedData = createWithEncodedData;
  public createWithPlugin = createWithPlugin;
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

  // Validation functions
  public verifyCall = verifyCall;

  // Getter functions
  protected _getDecodedCalls = _getDecodedCalls;
  protected _getCalls = _getCalls;
}
