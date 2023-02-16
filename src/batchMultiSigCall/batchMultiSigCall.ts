import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";
import { getDate } from "../helpers";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import { verifyCall } from "./methods/checkers";
import { create, createMultiple, exportFCT, getCall, importEncodedFCT, importFCT, setFromAddress } from "./methods/FCT";
import {
  createTypedData,
  getAllRequiredApprovals,
  getParamsFromCall,
  handleTo,
  handleValue,
  setOptions,
  verifyParams,
} from "./methods/helpers";
import { getPlugin, getPluginClass, getPluginData } from "./methods/plugins";
import { getComputedVariable, getExternalVariable, getOutputVariable, getVariable } from "./methods/variables";
import {
  BatchMultiSigCallConstructor,
  ComputedVariables,
  IFCTOptions,
  IMSCallInput,
  RequiredFCTOptions,
} from "./types";

export class BatchMultiSigCall {
  protected FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  protected FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
  protected batchMultiSigSelector = "0x2409a934";
  protected version = "0x010102";
  protected chainId: ChainId;

  public fromAddress: string;
  protected computedVariables: ComputedVariables[] = [];
  protected _calls: IMSCallInput[] = [];
  protected _options: IFCTOptions = {
    maxGasPrice: "30000000000", // 30 Gwei as default
    validFrom: getDate(), // Valid from now
    expiresAt: getDate(7), // Expires after 7 days
    purgeable: false,
    blockable: true,
    builder: "0x0000000000000000000000000000000000000000",
  };

  constructor(input: BatchMultiSigCallConstructor = {}) {
    if (input.chainId) {
      this.chainId = input.chainId;
    } else {
      this.chainId = "5"; // For now we default to Goerli. TODO: Change this to mainnet
    }

    if (input.options) this.setOptions(input.options);
  }

  // Helpers

  // Options
  public setOptions = setOptions;
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

  get calls(): IMSCallInput[] {
    return this._calls.map((call) => {
      return {
        ...call,
        from: this.fromAddress || call.from,
        value: call.value || "0",
        options: call.options || DEFAULT_CALL_OPTIONS,
      };
    });
  }

  // Plugin functions
  public getPlugin = getPlugin;
  public getPluginClass = getPluginClass;

  // FCT Functions
  public create = create;
  public createMultiple = createMultiple;
  public exportFCT = exportFCT;
  public importFCT = importFCT;
  public importEncodedFCT = importEncodedFCT;
  public getCall = getCall;
  public setFromAddress = setFromAddress;

  // Utility functions
  public getPluginData = getPluginData;
  public getAllRequiredApprovals = getAllRequiredApprovals;

  get length(): number {
    return this.calls.length;
  }

  // Variables
  protected getVariable = getVariable;
  protected getOutputVariable = getOutputVariable;
  protected getExternalVariable = getExternalVariable;
  protected getComputedVariable = getComputedVariable;

  // Internal helper functions
  protected createTypedData = createTypedData;
  protected getParamsFromCall = getParamsFromCall;
  protected verifyParams = verifyParams;
  protected handleTo = handleTo;
  protected handleValue = handleValue;

  // Validation functions
  protected verifyCall = verifyCall;
}
