import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";
import { getDate } from "../helpers";
import { RequiredKeys } from "../types";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import {
  _getCalls,
  _getComputedVariables,
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
  handleComputedVariable,
  handleTo,
  handleValue,
  importEncodedFCT,
  importFCT,
  setCallDefaults,
  setOptions,
  verifyCall,
} from "./methods";
import {
  BatchMultiSigCallConstructor,
  DecodedCalls,
  ICallDefaults,
  IFCTOptions,
  IMSCallInput,
  RequiredFCTOptions,
  StrictMSCallInput,
} from "./types";

export class BatchMultiSigCall {
  protected FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  protected FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
  protected batchMultiSigSelector = "0xf6407ddd";
  protected version = "0x010101";
  protected chainId: ChainId;

  protected _calls: RequiredKeys<IMSCallInput, "nodeId">[] = [];
  protected _options: IFCTOptions = {
    maxGasPrice: "30000000000", // 30 Gwei as default
    validFrom: getDate(), // Valid from now
    expiresAt: getDate(7), // Expires after 7 days
    purgeable: false,
    blockable: true,
    builder: "0x0000000000000000000000000000000000000000",
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
    return this._getComputedVariables();
  }

  // Set methods
  public setOptions = setOptions;
  public setCallDefaults = setCallDefaults;

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
  protected handleComputedVariable = handleComputedVariable;

  // Validation functions
  protected verifyCall = verifyCall;

  // Getter functions
  protected _getComputedVariables = _getComputedVariables;
  protected _getDecodedCalls = _getDecodedCalls;
  protected _getCalls = _getCalls;
}
