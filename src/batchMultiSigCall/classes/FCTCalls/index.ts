import { DEFAULT_CALL_OPTIONS } from "batchMultiSigCall/constants";
import { Interface } from "ethers/lib/utils";
import _ from "lodash";
import {
  DecodedCalls,
  DeepPartial,
  FCTCall,
  ICallDefaults,
  IMSCallInput,
  IMSCallInputWithNodeId,
  IMSCallWithEncodedData,
  IWithPlugin,
  ParamWithoutVariable,
  RequiredKeys,
  StrictMSCallInput,
} from "types";

import { CALL_TYPE } from "../../../constants";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import * as helpers from "./helpers";

function generateNodeId(): string {
  return [...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

export class FCTCalls {
  static helpers = helpers;

  public FCT: BatchMultiSigCall;
  private _calls: IMSCallInputWithNodeId[] = [];
  private _callDefault: ICallDefaults = {
    value: "0",
    options: DEFAULT_CALL_OPTIONS,
  };

  constructor(FCT: BatchMultiSigCall, callDefault?: DeepPartial<ICallDefaults>) {
    this.FCT = FCT;

    if (callDefault) {
      this._callDefault = _.merge({}, this._callDefault, callDefault);
    }
  }

  get(): StrictMSCallInput[] {
    return this._calls.map((call): StrictMSCallInput => {
      const fullCall = _.merge({}, this._callDefault, call);

      if (typeof fullCall.from === "undefined") {
        throw new Error("From address is required");
      }

      const from = fullCall.from;

      return { ...fullCall, from };
    });
  }

  getWithDecodedVariables(): DecodedCalls[] {
    return this.get().map((call) => {
      const params = call.params;
      if (params && params.length > 0) {
        const parameters = this.FCT.decodeParams(params);
        return { ...call, params: parameters };
      }
      return {
        ...call,
        params: [] as ParamWithoutVariable[],
      };
    });
  }

  public async create(call: FCTCall): Promise<IMSCallInputWithNodeId> {
    if ("plugin" in call) {
      return await this.createWithPlugin(call);
    } else if ("abi" in call) {
      return await this.createWithEncodedData(call);
    } else {
      const data = { ...call, nodeId: call.nodeId || generateNodeId() } satisfies IMSCallInputWithNodeId;
      return this.addCall(data);
    }
  }

  public async createWithPlugin(callWithPlugin: IWithPlugin): Promise<IMSCallInputWithNodeId> {
    const pluginCall = await callWithPlugin.plugin.create();
    if (pluginCall === undefined) {
      throw new Error("Error creating call with plugin. Make sure input values are valid");
    }

    const data = {
      ...pluginCall,
      from: callWithPlugin.from,
      options: { ...pluginCall.options, ...callWithPlugin.options },
      nodeId: callWithPlugin.nodeId || generateNodeId(),
    } satisfies IMSCallInputWithNodeId;
    return this.addCall(data);
  }

  public async createWithEncodedData(callWithEncodedData: IMSCallWithEncodedData): Promise<IMSCallInputWithNodeId> {
    const { value, encodedData, abi, options, nodeId } = callWithEncodedData;
    const iface = new Interface(abi);

    const {
      name,
      args,
      value: txValue,
      functionFragment: { inputs },
    } = iface.parseTransaction({
      data: encodedData,
      value: typeof value === "string" ? value : "0",
    });

    const data = {
      from: callWithEncodedData.from,
      to: callWithEncodedData.to,
      method: name,
      params: helpers.getParamsFromInputs(inputs, args),
      options,
      value: txValue?.toString(),
      nodeId: nodeId || generateNodeId(),
    } satisfies IMSCallInputWithNodeId;

    return this.addCall(data);
  }

  public setCallDefaults(callDefault: DeepPartial<ICallDefaults>): ICallDefaults {
    this._callDefault = _.merge({}, this._callDefault, callDefault);
    return this._callDefault;
  }

  private addCall(call: RequiredKeys<IMSCallInput, "nodeId">): RequiredKeys<IMSCallInput, "nodeId"> {
    // Before adding the call, we check if it is valid
    this.verifyCall(call);
    this._calls.push(call);

    return call;
  }

  private verifyCall(call: IMSCallInput) {
    // To address validator
    if (!call.to) {
      throw new Error("To address is required");
    } else if (typeof call.to === "string") {
      helpers.isAddress(call.to, "To");
    }

    // Value validator
    if (call.value && typeof call.value === "string") {
      helpers.isInteger(call.value, "Value");
    }

    // Method validator
    if (call.method && call.method.length === 0) {
      throw new Error("Method cannot be empty string");
    }

    // Node ID validator
    if (call.nodeId) {
      const index = this.get().findIndex((item) => item.nodeId === call.nodeId);

      if (index > -1) {
        throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
      }
    }

    // Options validator
    if (call.options) {
      const { gasLimit, callType } = call.options;
      if (gasLimit && typeof gasLimit === "string") {
        helpers.isInteger(gasLimit, "Gas limit");
      }
      if (callType) {
        const keysOfCALLTYPE = Object.keys(CALL_TYPE);
        if (!keysOfCALLTYPE.includes(callType)) {
          throw new Error(`Call type ${callType} is not valid`);
        }
      }
    }

    if (call.params && call.params.length) {
      if (!call.method) {
        throw new Error("Method is required when params are present");
      }
      call.params.map(helpers.verifyParam);
    }
  }
}
