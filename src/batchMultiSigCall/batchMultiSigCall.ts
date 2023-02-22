import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { ethers } from "ethers";
import _ from "lodash";

import FCTBatchMultiSigCallABI from "../abi/FCT_BatchMultiSigCall.abi.json";
import FCTControllerABI from "../abi/FCT_Controller.abi.json";
import { getDate, instanceOfVariable } from "../helpers";
import { Param, RequiredKeys } from "../types";
import { DEFAULT_CALL_OPTIONS } from "./constants";
import { verifyCall } from "./methods/checkers";
import {
  create,
  createMultiple,
  createPlugin,
  createWithEncodedData,
  createWithPlugin,
  exportFCT,
  getCall,
  importEncodedFCT,
  importFCT,
  setCallDefaults,
} from "./methods/FCT";
import {
  createTypedData,
  getAllRequiredApprovals,
  getParamsFromCall,
  handleTo,
  handleValue,
  setOptions,
} from "./methods/helpers";
import { getPlugin, getPluginClass, getPluginData } from "./methods/plugins";
import { getComputedVariable, getExternalVariable, getOutputVariable, getVariable } from "./methods/variables";
import {
  BatchMultiSigCallConstructor,
  ComputedVariables,
  ICallDefaults,
  IFCTOptions,
  IMSCallInput,
  RequiredFCTOptions,
  StrictMSCallInput,
} from "./types";

export class BatchMultiSigCall {
  protected FCT_Controller = new ethers.utils.Interface(FCTControllerABI);
  protected FCT_BatchMultiSigCall = new ethers.utils.Interface(FCTBatchMultiSigCallABI);
  protected batchMultiSigSelector = "0x2409a934";
  protected version = "0x010102";
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
    return this._calls.map((call): StrictMSCallInput => {
      const fullCall = _.merge({}, this._callDefault, call);

      if (typeof fullCall.from === "undefined") {
        throw new Error("From address is required");
      }

      const from = fullCall.from;

      return { ...fullCall, from };
    });
  }

  get decodedCalls() {
    const decodeParams = (params: Param[]) => {
      params.forEach((param) => {
        if (instanceOfVariable(param.value)) {
          param.value = this.getVariable(param.value, param.type);
        }
      });
    };
    return this.calls.map((call) => {
      if (call.params) {
        decodeParams(call.params);
      }
      return call;
    });
  }

  get computedVariables() {
    return this.calls.reduce((acc, call) => {
      if (call.params) {
        call.params.forEach((param) => {
          if (instanceOfVariable(param.value) && param.value.type === "computed") {
            const variable = param.value;
            acc.push({
              variable:
                typeof variable.id.variable === "string"
                  ? variable.id.variable
                  : this.getVariable(variable.id.variable, param.type),
              add: variable.id.add || "",
              sub: variable.id.sub || "",
              mul: variable.id.mul || "",
              div: variable.id.div || "",
            });
          }
        });
      }
      return acc;
    }, [] as ComputedVariables[]);
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

  // Validation functions
  protected verifyCall = verifyCall;
}
