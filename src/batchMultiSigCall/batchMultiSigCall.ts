import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";
import { getDate } from "../helpers";
import { verifyCall } from "./methods/checkers";
import { create, createMultiple, exportFCT, getCall, importEncodedFCT, importFCT } from "./methods/FCT";
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
import { BatchMultiSigCallConstructor, ComputedVariables, IFCTOptions, IMSCallInput } from "./types";

export class BatchMultiSigCall {
  protected FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  protected FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
  protected batchMultiSigSelector = "0x2409a934";
  protected version = "0x010102";
  protected chainId: ChainId;

  protected computedVariables: ComputedVariables[] = [];
  calls: IMSCallInput[] = [];
  options: IFCTOptions = {
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
