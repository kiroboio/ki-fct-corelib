import { utils } from "ethers";
import _ from "lodash";

import { CALL_TYPE } from "../../../constants";
import { instanceOfVariable } from "../../../helpers";
import { DeepPartial, Param, ParamWithoutVariable } from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { DEFAULT_CALL_OPTIONS } from "../../constants";
import {
  DecodedCalls,
  FCTCall,
  FCTMCall,
  ICallDefaults,
  IMSCallInput,
  IMSCallWithEncodedData,
  IWithPlugin,
  StrictMSCallInput,
} from "../../types";
import { FCTBase } from "../FCTBase";
import * as helpers from "./helpers";
import { CreateReturn } from "./types";

function generateNodeId(): string {
  return [...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

function instanceOfCallWithPlugin(object: any): object is IWithPlugin {
  return typeof object === "object" && "plugin" in object;
}

function instanceOfCallWithEncodedData(object: any): object is IMSCallWithEncodedData {
  return typeof object === "object" && "abi" in object;
}

export class FCTCalls extends FCTBase {
  static helpers = helpers;
  private _calls: FCTMCall[] = [];
  private _callDefault: ICallDefaults = {
    value: "0",
    options: DEFAULT_CALL_OPTIONS,
  };

  constructor(FCT: BatchMultiSigCall, callDefault?: DeepPartial<ICallDefaults>) {
    super(FCT);

    if (callDefault) {
      this._callDefault = _.merge({}, this._callDefault, callDefault);
    }
  }

  getCallDefaults(): ICallDefaults {
    return this._callDefault;
  }

  get(): StrictMSCallInput[] {
    return this._calls.map((call, index): StrictMSCallInput => {
      const fullCall = _.merge({}, this.getSpecificCallDefaults(index), call);

      if (typeof fullCall.from === "undefined") {
        throw new Error("From address is required");
      }

      const from = fullCall.from;

      return {
        ...fullCall,
        from,
      };
    });
  }

  getWithDecodedVariables(): DecodedCalls[] {
    return this.get().map((call) => {
      const params = call.params;
      if (params && params.length > 0) {
        const parameters = this.decodeParams(params);
        return { ...call, params: parameters };
      }
      return {
        ...call,
        params: [] as ParamWithoutVariable<Param>[],
      };
    });
  }

  public async create<C extends FCTCall>(call: C): Promise<CreateReturn<C>> {
    if (instanceOfCallWithPlugin(call)) {
      return (await this.createWithPlugin(call)) as CreateReturn<C>;
    } else if (instanceOfCallWithEncodedData(call)) {
      return this.createWithEncodedData(call) as CreateReturn<C>;
    } else {
      return this.createSimpleCall(call) as CreateReturn<C>;
    }
  }
  public async createWithPlugin<C extends IWithPlugin>(callWithPlugin: C): Promise<IMSCallInput & { nodeId: string }> {
    if (!callWithPlugin.plugin) {
      throw new Error("Plugin is required to create a call with plugin.");
    }

    const pluginCall = await callWithPlugin.plugin.create();
    if (!pluginCall) {
      throw new Error("Error creating call with plugin. Make sure input values are valid");
    }

    const data = {
      ...pluginCall,
      from: callWithPlugin.from,
      options: { ...pluginCall.options, ...callWithPlugin.options },
      nodeId: callWithPlugin.nodeId || generateNodeId(),
    };
    return this.addCall<typeof data>(data);
  }

  public createWithEncodedData<C extends IMSCallWithEncodedData>(
    callWithEncodedData: C
  ): IMSCallInput & { nodeId: string } {
    const { value, encodedData, abi, options, nodeId } = callWithEncodedData;
    const iface = new utils.Interface(abi);

    try {
      const {
        name,
        args,
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
        value: value?.toString(),
        nodeId: nodeId || generateNodeId(),
      };

      return this.addCall<typeof data>(data);
    } catch {
      throw new Error("Failed to parse encoded data");
    }
  }

  public createSimpleCall<C extends IMSCallInput>(call: C): C & { nodeId: string } {
    const data = _.merge({}, call, { nodeId: call.nodeId || generateNodeId() });
    return this.addCall(data);
  }

  public setCallDefaults<C extends DeepPartial<ICallDefaults>>(callDefault: C): ICallDefaults & C {
    this._callDefault = _.merge({}, this._callDefault, callDefault);
    return this._callDefault as ICallDefaults & C;
  }

  public addCall<C extends IMSCallInput & { nodeId: string }>(call: C): C {
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
      if (gasLimit) {
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

  public decodeParams<P extends Param>(params: P[]): ParamWithoutVariable<P>[] {
    return params.reduce((acc, param) => {
      if (param.type === "tuple" || param.customType) {
        if (param.type.lastIndexOf("[") > 0) {
          const value = param.value as Param[][];
          const decodedValue = value.map((tuple) => this.decodeParams(tuple));
          return [...acc, { ...param, value: decodedValue }];
        }

        const value = this.decodeParams(param.value as Param[]);
        return [...acc, { ...param, value }];
      }
      if (instanceOfVariable(param.value)) {
        const value = this.FCT.variables.getVariable(param.value, param.type);
        const updatedParam = { ...param, value };
        return [...acc, updatedParam];
      }
      return [...acc, param as ParamWithoutVariable<P>];
    }, [] as ParamWithoutVariable<P>[]);
  }

  private getSpecificCallDefaults = (index: number) => {
    const optionsPayerIndex = this._callDefault.options.payerIndex;
    const payerIndex = optionsPayerIndex !== undefined ? optionsPayerIndex : index + 1;
    return {
      ...this._callDefault,
      options: {
        ...this._callDefault.options,
        payerIndex,
      },
    };
  };
}
