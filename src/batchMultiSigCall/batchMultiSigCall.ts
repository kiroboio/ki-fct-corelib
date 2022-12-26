import { ethers } from "ethers";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCT_ControllerABI from "../abi/FCT_Controller.abi.json";
import { getDate } from "../helpers";
import FCTControllerAddresses from "./data";
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
    chainId?: number;
  }) {
    this.FCT_Controller = new ethers.Contract(
      contractAddress || FCTControllerAddresses[chainId || 1],
      FCT_ControllerABI,
      provider
    );

    if (chainId) {
      this.chainId = chainId;
    }

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

  // End of variables
  //
  //
  // Options

  public setOptions = setOptions;

  // End of options
  //
  //
  // Plugin functions

  public getPlugin = getPlugin;
  public getPluginClass = getPluginClass;

  // End of plugin functions
  //
  //
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

  // End of main FCT functions
  //
  //
  // Helpers functions

  protected createTypedData = createTypedData;
  protected getParamsFromCall = getParamsFromCall;
  protected verifyParams = verifyParams;
  protected handleTo = handleTo;
  protected handleValue = handleValue;
}
