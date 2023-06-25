import { ChainId } from "@kiroboio/fct-plugins";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import { ethers } from "ethers";
import { hexlify, id } from "ethers/lib/utils";
import _ from "lodash";

import { CALL_TYPE_MSG } from "../../../../constants";
import { flows } from "../../../../constants/flows";
import { InstanceOf } from "../../../../helpers";
import {
  BatchMultiSigCallTypedData,
  CallOptions,
  DeepRequired,
  FCTCallParam,
  Param,
  ParamWithoutVariable,
  TypedDataMessageTransaction,
  Variable,
} from "../../../../types";
import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { DEFAULT_CALL_OPTIONS, NO_JUMP } from "../../../constants";
import { CallID } from "../../CallID";
import { generateNodeId, getParams, getTypesArray } from "../helpers";
import { getEncodedMethodParams } from "../helpers/callParams";
import { ICall } from "../types";
import { FCT_MULTICALL_ADDRESS } from "./constants";

interface IMulticall {
  target: string;
  callType: "action" | "view only";
  method: string;
  params: Param[];
}

interface IFCTMulticallConstructor {
  from: string | Variable;
  options?: Omit<CallOptions, "callType">;
  nodeId?: string;
  FCT: BatchMultiSigCall;
}

export class Multicall implements ICall {
  protected FCT: BatchMultiSigCall;

  private _calls: IMulticall[] = [];
  private _from: string | Variable;
  private _nodeId: string;
  private _options: CallOptions = { callType: "LIBRARY" };
  private _to: string;
  private _chainId: ChainId;
  constructor(input: IFCTMulticallConstructor) {
    this._from = input.from;
    this.FCT = input.FCT;
    this._options = _.merge({}, this._options, input.options);
    this._nodeId = input.nodeId || generateNodeId();
  }

  get to() {
    if (this._to) return this._to;
    if (!this._chainId) throw new Error("Chain ID is required");
    return FCT_MULTICALL_ADDRESS[this._chainId];
  }
  //
  get toENS() {
    return "@lib:multicall";
  }
  //
  // get method() {
  //   return "multicall";
  // }
  //
  // get value() {
  //   return "0"; // For now we only support multicalls with no value
  // }

  get options(): DeepRequired<CallOptions> {
    return _.merge({}, DEFAULT_CALL_OPTIONS, this._options);
  }

  get get() {
    if (!this._from) throw new Error("From address is required");
    return {
      to: this.to,
      toENS: "@lib:multicall",
      from: this._from,
      params: this.params,
      method: "multicall",
      value: "0",
      options: this.options,
      nodeId: this._nodeId,
    };
  }

  get getDecoded() {
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

  get params(): Param[] {
    return [
      {
        name: "calls",
        type: "Multicall[]",
        customType: true,
        value: this._calls.map((call) => {
          return [
            {
              name: "target",
              type: "address",
              value: call.target,
            },
            {
              name: "ctype",
              type: "bytes32",
              value: call.callType,
              hashed: true,
            },
            {
              name: "method",
              type: "bytes32",
              value: call.method,
              hashed: true,
            },
            {
              name: "data",
              type: "bytes",
              value: getEncodedMethodParams(call),
            },
          ] as Param[];
        }),
      },
    ];
  }

  public getAsMCall = (typedData: BatchMultiSigCallTypedData, index: number) => {
    return {
      typeHash: hexlify(TypedDataUtils.hashType(`transaction${index + 1}`, typedData.types)),
      ensHash: id(this.toENS),
      functionSignature: this.getFunctionSignature(),
      value: "0",
      callId: CallID.asString({
        calls: this.FCT.calls,
        validation: this.FCT.validation,
        call: this.get,
        index,
      }),
      from: this.FCT.variables.getValue(this._from, "address"),
      to: this.to,
      data: this.getEncodedData(),
      types: this.getTypesArray(),
      typedHashes: this.getTypedHashes(),
    };
  };

  public generateEIP712Message(index: number): TypedDataMessageTransaction {
    const paramsData = this.getParamsEIP712();
    const call = this.get;
    const options = this.options;
    const flow = flows[options.flow].text;

    const { jumpOnSuccess, jumpOnFail } = this.getJumps(index);

    return {
      call: {
        call_index: index + 1,
        payer_index: index + 1,
        call_type: CALL_TYPE_MSG[call.options.callType],
        from: this.FCT.variables.getValue(call.from, "address"),
        to: this.FCT.variables.getValue(call.to, "address"),
        to_ens: call.toENS || "",
        eth_value: this.FCT.variables.getValue(call.value, "uint256", "0"),
        gas_limit: options.gasLimit,
        permissions: 0,
        validation: call.options.validation ? this.FCT.validation.getIndex(call.options.validation) : 0,
        flow_control: flow,
        returned_false_means_fail: options.falseMeansFail,
        jump_on_success: jumpOnSuccess,
        jump_on_fail: jumpOnFail,
        method_interface: this.getFunction(),
      },
      ...paramsData,
    };
  }

  public getFunction() {
    return "multicall((address,bytes32,bytes32,bytes)[])";
  }

  public getFunctionSignature() {
    return ethers.utils.id(this.getFunction());
  }

  public getEncodedData() {
    return getEncodedMethodParams(this.get);
  }

  public getTypesArray(): number[] {
    const call = this.get;
    if (!call.params) {
      return [];
    }

    return getTypesArray(call.params);
  }

  public getTypedHashes(): string[] {
    const { structTypes, callType } = this.generateEIP712Type();

    return this.getUsedStructTypes(structTypes, callType.slice(1)).map((type) => {
      return hexlify(TypedDataUtils.hashType(type, structTypes));
    });
  }

  public generateEIP712Type() {
    const call = this.get;
    if (!call.params || (call.params && call.params.length === 0)) {
      return {
        structTypes: {},
        callType: [{ name: "call", type: "Call" }],
      };
    }

    const structTypes: { [key: string]: { name: string; type: string }[] } = {};

    const callParameters = call.params.map((param: Param) => {
      const typeName = this.getStructType({
        param,
        nodeId: call.nodeId,
        structTypes,
      });

      return {
        name: param.name,
        type: typeName,
      };
    });
    return {
      structTypes,
      callType: [{ name: "call", type: "Call" }, ...callParameters],
    };
  }

  public add = (call: IMulticall) => {
    this._calls.push(call);
    return this._calls;
  };

  public setFrom = (from: string | Variable) => {
    this._from = from;
    return this._from;
  };

  public setOptions = (options: Omit<CallOptions, "callType">) => {
    this._options = _.merge({}, this._options, options);
    return this._options;
  };

  public setNodeId = (nodeId: string) => {
    this._nodeId = nodeId;
    return this._nodeId;
  };

  public setChainId = (chainId: ChainId) => {
    this._chainId = chainId;
    return this._chainId;
  };

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
      if (InstanceOf.Variable(param.value)) {
        const value = this.FCT.variables.getVariable(param.value, param.type);
        const updatedParam = { ...param, value };
        return [...acc, updatedParam];
      }
      return [...acc, param as ParamWithoutVariable<P>];
    }, [] as ParamWithoutVariable<P>[]);
  }

  private getUsedStructTypes(
    typedData: Record<string, { name: string; type: string }[]>,
    mainType: { name: string; type: string }[]
  ): string[] {
    return mainType.reduce((acc, item) => {
      if (item.type.includes("Struct_")) {
        const type = item.type.replace("[]", "");
        return [...acc, type, ...this.getUsedStructTypes(typedData, typedData[type])];
      }
      return acc;
    }, [] as string[]);
  }

  private getStructType({
    param,
    nodeId,
    structTypes = {},
  }: {
    param: Param;
    nodeId: string;
    structTypes?: Record<string, { name: string; type: string }[]>;
  }): string {
    if (!param.customType && !param.type.includes("tuple")) {
      return param.type;
    }

    let paramValue: Param[] | Param[][];

    if (InstanceOf.TupleArray(param.value, param)) {
      paramValue = param.value[0];
    } else if (InstanceOf.Tuple(param.value, param)) {
      paramValue = param.value;
    } else {
      throw new Error(`Invalid param value: ${param.value} for param: ${param.name}`);
    }

    const generalType = paramValue.map((item) => {
      if (item.customType || item.type.includes("tuple")) {
        const typeName = this.getStructType({
          param: item,
          nodeId,
          structTypes,
        });
        // structTypes = { ...structTypes, ...newStructTypes };
        return {
          name: item.name,
          type: typeName,
        };
      }
      return {
        name: item.name,
        type: item.type,
      };
    });

    // If param type is array, we need to add [] to the end of the type
    const typeName = `Struct_${nodeId}_${Object.keys(structTypes).length}`;
    structTypes[typeName] = generalType;
    return typeName + (param.type.includes("[]") ? "[]" : "");
  }

  private getParamsEIP712(): Record<string, FCTCallParam> {
    if (!this.getDecoded.params) {
      return {};
    }
    return {
      ...getParams(this.getDecoded.params),
    };
  }

  private getJumps(index: number): { jumpOnSuccess: number; jumpOnFail: number } {
    let jumpOnSuccess = 0;
    let jumpOnFail = 0;
    const call = this.get;
    const options = call.options;

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
      jumpOnSuccess,
      jumpOnFail,
    };
  }
}
