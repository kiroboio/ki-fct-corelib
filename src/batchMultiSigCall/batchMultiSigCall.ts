import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";
import { getDate, instanceOfVariable } from "../helpers";
import { RequiredKeys, Variable } from "../types";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import { TYPED_DATA_DOMAIN } from "./helpers/fct";
import {
  _getCalls,
  _getDecodedCalls,
  create,
  createMultiple,
  createPlugin,
  createTypedData,
  createWithEncodedData,
  createWithPlugin,
  decodeParams,
  exportFCT,
  getAllRequiredApprovals,
  getCall,
  getComputedVariable,
  getExternalVariable,
  getOutputVariable,
  getParamsFromCall,
  getPlugin,
  getPluginClass,
  getPluginData,
  getVariable,
  handleTo,
  handleValue,
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
  IFCTOptions,
  IMSCallInput,
  RequiredFCTOptions,
  StrictMSCallInput,
  TypedDataDomain,
} from "./types";

export class BatchMultiSigCall {
  protected FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  protected FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
  protected batchMultiSigSelector = "0xf6407ddd";
  protected version = "0x010101";
  protected chainId: ChainId;
  protected domain: TypedDataDomain;

  protected _computed: Required<IComputed>[] = [];
  protected _calls: RequiredKeys<IMSCallInput, "nodeId">[] = [];
  protected _options: IFCTOptions = {
    maxGasPrice: "30000000000", // 30 Gwei as default
    validFrom: getDate(), // Valid from now
    expiresAt: getDate(7), // Expires after 7 days
    purgeable: false,
    blockable: true,
    builder: "0x0000000000000000000000000000000000000000",
    authEnabled: true,
  };

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
    return {
      ...this._options,
      name: this._options.name || "",
      recurrency: {
        maxRepeats: this._options.recurrency?.maxRepeats || "1",
        chillTime: this._options.recurrency?.chillTime || "0",
        accumetable: this._options.recurrency?.accumetable || false,
      },
      multisig: {
        externalSigners: this._options.multisig?.externalSigners || [],
        minimumApprovals: this._options.multisig?.minimumApprovals || "1",
      },
    };
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
  protected getVariable = getVariable;
  protected getOutputVariable = getOutputVariable;
  protected getExternalVariable = getExternalVariable;
  protected getComputedVariable = getComputedVariable;

  // Internal helper functions
  protected createTypedData = createTypedData;
  protected getParamsFromCall = getParamsFromCall;
  protected handleTo = handleTo;
  protected handleValue = handleValue;
  protected decodeParams = decodeParams;

  // Validation functions
  protected verifyCall = verifyCall;

  // Getter functions
  protected _getDecodedCalls = _getDecodedCalls;
  protected _getCalls = _getCalls;
}
