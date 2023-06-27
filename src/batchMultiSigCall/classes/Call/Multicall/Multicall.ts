import { PluginInstance } from "@kiroboio/fct-plugins";
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
  Param,
  ParamWithoutVariable,
  TypedDataMessageTransaction,
  Variable,
} from "../../../../types";
import { BatchMultiSigCall } from "../../../batchMultiSigCall";
import { DEFAULT_CALL_OPTIONS, NO_JUMP } from "../../../constants";
import { CallID } from "../../CallID";
import { generateNodeId, getTypesArray } from "../helpers";
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

const callOptionType = {
  ACTION: "action",
  VIEW_ONLY: "view only",
} as const;

export class Multicall implements ICall {
  protected FCT: BatchMultiSigCall;

  private _calls: IMulticall[] = [];
  private _from: string | Variable;
  private _nodeId: string;
  private _options: CallOptions = { callType: "LIBRARY" };
  private _to: string;
  constructor(input: IFCTMulticallConstructor) {
    this._from = input.from;
    this.FCT = input.FCT;
    this._options = _.merge({}, this._options, input.options);
    this._nodeId = input.nodeId || generateNodeId();
  }

  get to() {
    if (this._to) return this._to;
    return FCT_MULTICALL_ADDRESS[this.FCT.chainId];
  }
  //
  get toENS() {
    return "@lib:multicall";
  }

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

  get EIP712MessageData() {
    const calls = this._calls;
    return calls.map((call) => ({
      target: call.target,
      ctype: call.callType,
      method: call.method,
      ...call.params.reduce((acc, param) => {
        return {
          ...acc,
          [param.name]: param.value,
        };
      }, {}),
    }));
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

  public add = (call: IMulticall) => {
    this._calls.push(call);
    return this._calls;
  };

  public addPlugin = async (plugin: PluginInstance) => {
    const call = await plugin.create();
    if (!call) {
      throw new Error("Error when creating call from plugin");
    }

    const data: IMulticall = {
      callType: callOptionType[call.options?.callType as keyof typeof callOptionType] || "action",
      target: call.to,
      params: call.params,
      method: call.method,
    };

    return this.add(data);
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
        value: this.FCT.variables.getValue(call.value, "uint256", "0"),
        gas_limit: options.gasLimit,
        permissions: 0,
        validation: call.options.validation ? this.FCT.validation.getIndex(call.options.validation) : 0,
        flow_control: flow,
        returned_false_means_fail: options.falseMeansFail,
        jump_on_success: jumpOnSuccess,
        jump_on_fail: jumpOnFail,
        method_interface: this.getFunction(),
      },
      calls: this.EIP712MessageData,
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
    const calls = this._calls;

    if (calls.length === 0) {
      throw new Error("No calls have been added to ");
    }

    const paramsTypes = calls[0].params.reduce(
      (acc, param) => {
        return [...acc, { name: param.name, type: param.type }];
      },
      [] as {
        name: string;
        type: string;
      }[]
    );

    const structTypes = {
      [`Multicall_${this.get.nodeId}`]: [
        {
          name: "target",
          type: "address",
        },
        {
          name: "ctype",
          type: "string",
        },
        {
          name: "method",
          type: "string",
        },
        ...paramsTypes,
      ],
    };

    return {
      structTypes,
      callType: [
        { name: "call", type: "Call" },
        { name: "calls", type: `Multicall_${this.get.nodeId}[]` },
      ],
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
        return {
          name: item.name,
          type: typeName,
        };
      }
      return {
        name: item.name,
        type: item.hashed ? "string" : item.type,
      };
    });

    // If param type is array, we need to add [] to the end of the type
    const typeName = `Struct_${nodeId}_${Object.keys(structTypes).length}`;
    structTypes[typeName] = generalType;
    return typeName + (param.type.includes("[]") ? "[]" : "");
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

// 0x0000000000000000000000000000000000000000000000000000000000000020
//   0000000000000000000000000000000000000000000000000000000000000001
//   0000000000000000000000000000000000000000000000000000000000000020
//   00000000000000000000000037b51c9edaa9894bde4904bfedd6309a3c8ba044
//   15eef5bfea8da92e7e8fec353cef8b538633489b095e0b71a9d2a347f67036bd
//   b483afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e
//   0000000000000000000000000000000000000000000000000000000000000080
//   0000000000000000000000000000000000000000000000000000000000000040
//   000000000000000000000000842eb778bd0f7938e5e7ccd754dc502774c3abcc
//   0000000000000000000000000000000000000000000000000000000000000064

// 0x0000000000000000000000000000000000000000000000000000000000000020
//   0000000000000000000000000000000000000000000000000000000000000002
//   0000000000000000000000000000000000000000000000000000000000000040
//   0000000000000000000000000000000000000000000000000000000000000120
//   000000000000000000000000cd24675adcb2c1a6c99d84871a419b2553e107bb
//   15eef5bfea8da92e7e8fec353cef8b538633489b095e0b71a9d2a347f67036bd
//   b483afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e
//   0000000000000000000000000000000000000000000000000000000000000080
//   0000000000000000000000000000000000000000000000000000000000000040
//   00000000000000000000000005ebaab32a73991c0960041b81ffe9459dedb1da
//   0000000000000000000000000000000000000000000000000000000000000064
//   000000000000000000000000619d3d0d392a020d84a3e2e21f175d0985ea4696
//   15eef5bfea8da92e7e8fec353cef8b538633489b095e0b71a9d2a347f67036bd
//   b483afd3f4caedc6eebf44246fe54e38c95e3179a5ec9ea81740eca5b482d12e
//   0000000000000000000000000000000000000000000000000000000000000080
//   0000000000000000000000000000000000000000000000000000000000000040
//   0000000000000000000000009477744e252d1b92dca6e1688e6d040d8e7f181b
//   0000000000000000000000000000000000000000000000000000000000000064
