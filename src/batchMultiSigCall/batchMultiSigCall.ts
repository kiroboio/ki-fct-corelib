import { ethers } from "ethers";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCT_ControllerABI from "../abi/FCT_Controller.abi.json";
import { getDate } from "../helpers";
import { addresses } from "./data";
import { create, createMultiple, exportFCT, getCall, importEncodedFCT, importFCT } from "./methods/FCT";
import {
  createTypedData,
  getAllRequiredApprovals,
  getCalldataForActuator,
  getParamsFromCall,
  handleTo,
  handleValue,
  setOptions,
  verifyParams,
} from "./methods/helpers";
import { getPlugin, getPluginClass } from "./methods/plugins";
import { getComputedVariable, getExternalVariable, getOutputVariable, getVariable } from "./methods/variables";
import { ComputedVariables, IFCTOptions, IMSCallInput } from "./types";
import { getPluginData } from "./utils";

type ChainId = 1 | 5;

export class BatchMultiSigCall {
  protected FCT_Controller: ethers.Contract;
  protected FCT_BatchMultiSigCall: ethers.utils.Interface;
  protected batchMultiSigSelector = "0x2409a934";
  protected provider: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
  protected chainId: number;

  protected computedVariables: ComputedVariables[] = [];
  calls: IMSCallInput[] = [];
  options: IFCTOptions = {
    maxGasPrice: "100000000000", // 100 Gwei as default
    validFrom: getDate(), // Valid from now
    expiresAt: getDate(7), // Expires after 7 days
    purgeable: false,
    blockable: true,
    builder: "0x0000000000000000000000000000000000000000",
  };

  constructor({
    provider,
    contractAddress,
    options,
    chainId,
  }: {
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
    contractAddress?: string;
    options?: Partial<IFCTOptions>;
    chainId?: ChainId;
  }) {
    if (chainId) {
      this.chainId = chainId;
    } else {
      this.chainId = 1;
    }

    this.FCT_Controller = new ethers.Contract(
      contractAddress || addresses[chainId].FCT_Controller,
      FCT_ControllerABI,
      provider
    );

    this.FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
    this.provider = provider;

    if (options) {
      this.setOptions(options);
    }
  }

  // Helpers
  public getCalldataForActuator = getCalldataForActuator;
  public getAllRequiredApprovals = getAllRequiredApprovals;

  // Variables
  protected getVariable = getVariable;
  protected getOutputVariable = getOutputVariable;
  protected getExternalVariable = getExternalVariable;
  protected getComputedVariable = getComputedVariable;

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

  get length(): number {
    return this.calls.length;
  }

  // Helpers functions
  protected createTypedData = createTypedData;
  protected getParamsFromCall = getParamsFromCall;
  protected verifyParams = verifyParams;
  protected handleTo = handleTo;
  protected handleValue = handleValue;

  // Utility functions
  // public utils = utils;
  public getPluginData = getPluginData;
}
