import { PluginInstance } from "@kiroboio/fct-plugins";
import { TypedDataUtils } from "@metamask/eth-sig-util";
import { ethers } from "ethers";
import { hexlify, id } from "ethers/lib/utils";
import _ from "lodash";

import { CALL_TYPE_MSG } from "../../../../constants";
import { flows } from "../../../../constants/flows";
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
import { DEFAULT_CALL_OPTIONS } from "../../../constants";
import { CallID } from "../../CallID";
import { generateNodeId, getEncodedMethodParams, getTypesArray } from "../helpers";
import { decodeParams, getJumps, getUsedStructTypes } from "../methods";
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
  FCT: BatchMultiSigCall;

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

  get data() {
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

  get decodedData() {
    const params = this.data.params;
    if (params && params.length > 0) {
      const parameters = this.decodeParams(params);
      return { ...this.data, params: parameters };
    }
    return {
      ...this.data,
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
        calls: this.FCT.callsAsObjects,
        validation: this.FCT.validation,
        call: this.data,
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
    const call = this.data;
    const options = call.options;
    const flow = flows[options.flow].text;

    const { jumpOnSuccess, jumpOnFail } = this.getJumps(index);

    return {
      call: {
        call_index: index + 1,
        payer_index: index + 1,
        call_type: CALL_TYPE_MSG[options.callType],
        from: this.FCT.variables.getValue(call.from, "address"),
        to: this.FCT.variables.getValue(call.to, "address"),
        to_ens: call.toENS || "",
        value: this.FCT.variables.getValue(call.value, "uint256", "0"),
        gas_limit: options.gasLimit,
        permissions: 0,
        validation: options.validation ? this.FCT.validation.getIndex(options.validation) : 0,
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
    return getEncodedMethodParams(this.decodedData);
  }

  public getTypesArray(): number[] {
    const call = this.data;
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
      [`Multicall_${this.data.nodeId}`]: [
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
        { name: "calls", type: `Multicall_${this.data.nodeId}[]` },
      ],
    };
  }

  private decodeParams = decodeParams;
  private getUsedStructTypes = getUsedStructTypes;
  private getJumps = getJumps;
}
