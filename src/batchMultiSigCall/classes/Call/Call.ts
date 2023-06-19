import _ from "lodash";

import { CALL_TYPE, CALL_TYPE_MSG } from "../../../constants";
import { flows } from "../../../constants/flows";
import { instanceOfVariable } from "../../../helpers";
import {
  CallOptions,
  DecodedCalls,
  DeepRequired,
  FCTCallParam,
  Param,
  ParamWithoutVariable,
  StrictMSCallInput,
  TypedDataMessageTransaction,
} from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { NO_JUMP } from "../../constants";
import { handleMethodInterface } from "../../helpers";
import { IMSCallInput, IWithPlugin } from "../../types";
import { FCTBase } from "../FCTBase";
import * as helpers from "../FCTCalls/helpers";
import { getParams } from "./helpers";

function generateNodeId(): string {
  return [...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

function instanceOfCallWithPlugin(object: any): object is IWithPlugin {
  return typeof object === "object" && "plugin" in object;
}

const isInstanceOfTupleArray = (value: Param["value"], param: Param): value is Param[][] => {
  return (param.customType ?? false) && param.type.lastIndexOf("[") > 0;
};

const isInstanceOfTuple = (value: Param["value"], param: Param): value is Param[] => {
  return (param.customType ?? false) && param.type.lastIndexOf("[") === -1;
};

// function instanceOfCallWithEncodedData(object: any): object is IMSCallWithEncodedData {
//   return typeof object === "object" && "abi" in object;
// }

export class Call extends FCTBase {
  protected _call: IMSCallInput & { nodeId: string };

  constructor({ FCT, input }: { FCT: BatchMultiSigCall; input: IMSCallInput }) {
    super(FCT);

    let fullInput: IMSCallInput & { nodeId: string };
    if (!input.nodeId) {
      fullInput = { ...input, nodeId: generateNodeId() };
    } else {
      fullInput = input as IMSCallInput & { nodeId: string };
    }
    this.verifyCall(fullInput);
    this._call = fullInput;
  }

  get get(): StrictMSCallInput {
    return _.merge({}, this.FCT.callDefault, this._call);
  }

  get options(): DeepRequired<CallOptions> {
    return this.get.options;
  }

  get getDecoded(): DecodedCalls {
    const params = this.get.params;
    if (params && params.length > 0) {
      const parameters = this.decodeParams(params);
      return { ...this.get, params: parameters };
    }
    return {
      ...this.get,
      params: [] as ParamWithoutVariable<Param>[],
    };
  }

  public generateEIP712Type() {
    const call = this.get;
    const structTypes: { [key: string]: { name: string; type: string }[] } = {};

    function getStructType(param: Param, index: number, innerIndex = 0) {
      const typeName = `CallStruct_${call.nodeId}_${index}_${innerIndex}`;

      let paramValue: Param[] | Param[][];

      if (isInstanceOfTupleArray(param.value, param)) {
        paramValue = param.value[0];
      } else if (isInstanceOfTuple(param.value, param)) {
        paramValue = param.value;
      } else {
        throw new Error(`Invalid param value: ${param.value} for param: ${param.name}`);
      }

      structTypes[typeName] = paramValue.map((item) => {
        if (item.customType || item.type.includes("tuple")) {
          const innerType = getStructType(item, index, innerIndex++);
          return {
            name: item.name,
            type: innerType,
          };
        }
        return {
          name: item.name,
          type: item.type,
        };
      });

      if (param.type.lastIndexOf("[") > 0) {
        for (const parameter of (param.value as Param[][])[0]) {
          if (parameter.customType || parameter.type.includes("tuple")) {
            getStructType(parameter, index, innerIndex);
          }
        }
      } else {
        for (const parameter of param.value as Param[]) {
          if (parameter.customType || parameter.type.includes("tuple")) {
            getStructType(parameter, index, innerIndex);
          }
        }
      }

      return typeName;
    }
    const values = call.params
      ? call.params.map((param: Param, i: number) => {
          if (param.customType || param.type === "tuple") {
            const type = getStructType(param, i);
            return { name: param.name, type: param.type.lastIndexOf("[") > 0 ? `${type}[]` : type };
          }
          return {
            name: param.name,
            type: param.type,
          };
        })
      : [];
    return {
      structTypes,
      callType: [{ name: "call", type: "Call" }, ...values],
    };
  }

  public generateEIP712Message(index: number): TypedDataMessageTransaction {
    const paramsData = this.getParamsEIP712();
    const call = this.get;
    const options = this.options;
    const flow = options.flow ? flows[options.flow].text : "continue on success, revert on fail";

    let jumpOnSuccess = 0;
    let jumpOnFail = 0;

    if (options.jumpOnSuccess && options.jumpOnSuccess !== NO_JUMP) {
      const jumpOnSuccessIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnSuccess);

      if (jumpOnSuccessIndex === -1) {
        throw new Error(`Jump on success node id ${options.jumpOnSuccess} not found`);
      }

      if (jumpOnSuccessIndex <= index) {
        throw new Error(
          `Jump on success node id ${options.jumpOnSuccess} is current or before current node (${call.nodeId})`
        );
      }

      jumpOnSuccess = jumpOnSuccessIndex - index - 1;
    }

    if (options.jumpOnFail && options.jumpOnFail !== NO_JUMP) {
      const jumpOnFailIndex = this.FCT.calls.findIndex((c) => c.nodeId === options.jumpOnFail);

      if (jumpOnFailIndex === -1) {
        throw new Error(`Jump on fail node id ${options.jumpOnFail} not found`);
      }

      if (jumpOnFailIndex <= index) {
        throw new Error(
          `Jump on fail node id ${options.jumpOnFail} is current or before current node (${call.nodeId})`
        );
      }

      jumpOnFail = jumpOnFailIndex - index - 1;
    }

    return {
      call: {
        call_index: index + 1,
        payer_index: index + 1,
        call_type: call.options?.callType ? CALL_TYPE_MSG[call.options.callType] : CALL_TYPE_MSG.ACTION,
        from: this.FCT.variables.getValue(call.from, "address"),
        to: this.FCT.variables.getValue(call.to, "address"),
        to_ens: call.toENS || "",
        eth_value: this.FCT.variables.getValue(call.value, "uint256", "0"),
        gas_limit: options.gasLimit,
        permissions: 0,
        validation: call.options?.validation ? this.FCT.validation.getIndex(call.options.validation) : 0,
        flow_control: flow,
        returned_false_means_fail: options.falseMeansFail || false,
        jump_on_success: jumpOnSuccess,
        jump_on_fail: jumpOnFail,
        method_interface: handleMethodInterface(call),
      },
      ...paramsData,
    };
  }

  private getParamsEIP712(): Record<string, FCTCallParam> {
    if (!this.get.params) {
      return {};
    }
    return {
      ...this.get.params.reduce((acc, param) => {
        let value: FCTCallParam;

        if (param.customType || param.type.includes("tuple")) {
          if (param.type.lastIndexOf("[") > 0) {
            const valueArray = param.value as Param[][];
            value = valueArray.map((item) => getParams(item));
          } else {
            const valueArray = param.value as Param[];
            value = getParams(valueArray);
          }
        } else {
          value = param.value as string[] | string | boolean;
        }
        return {
          ...acc,
          [param.name]: value,
        };
      }, {}),
    };
  }

  private decodeParams<P extends Param>(params: P[]): ParamWithoutVariable<P>[] {
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
      const index = this.FCT.calls.findIndex((item) => item.nodeId === call.nodeId);

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
  static async create({ call, FCT }: { call: IMSCallInput | IWithPlugin; FCT: BatchMultiSigCall }) {
    if (instanceOfCallWithPlugin(call)) {
      return await this.createWithPlugin(FCT, call);
    } else {
      return this.createSimpleCall(FCT, call);
    }

    // Remove createWithEncodedData, this is the full function
    // if (instanceOfCallWithPlugin(call)) {
    //   return await this.createWithPlugin(call);
    // } else if (instanceOfCallWithEncodedData(call)) {
    //   return this.createWithEncodedData(call);
    // } else {
    //   return this.createSimpleCall(call);
    // }
  }

  private static async createWithPlugin(FCT: BatchMultiSigCall, callWithPlugin: IWithPlugin): Promise<Call> {
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
    return new Call({ FCT, input: data });
  }

  private static createSimpleCall<C extends IMSCallInput>(FCT: BatchMultiSigCall, call: C): Call {
    return new Call({ FCT, input: call });
  }
}
