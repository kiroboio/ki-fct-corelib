/*
 * This class will be used to create
 * a FCT call, which is a multicall
 */

import { ChainId } from "@kiroboio/fct-plugins";
import _ from "lodash";

import { getEncodedMethodParams } from "../../../../helpers";
import { CallOptions, Param, StrictMSCallInput, Variable } from "../../../../types";
import { generateNodeId } from "../FCTCalls";
import { FCT_MULTICALL_ADDRESS } from "./constants";
import { IMulticall } from "./types";

interface IFCTMulticallConstructor {
  from: string | Variable;
  options?: CallOptions;
  nodeId?: string;
}

type IFCTMulticall = StrictMSCallInput & {
  options: CallOptions;
};

export class FCTMulticall {
  public calls: IMulticall[] = [];
  public from: string | Variable;
  public nodeId = "";
  public chainId: ChainId;
  public options: CallOptions = {};

  constructor(
    input: IFCTMulticallConstructor = {
      from: "",
    }
  ) {
    if (!input.from) throw new Error("From address is required");
    this.from = input.from;

    this.options = input.options || {};
    this.nodeId = input.nodeId || generateNodeId();
  }

  public add = (call: IMulticall) => {
    this.calls.push(call);
    return this.calls;
  };

  public setFrom = (from: string | Variable) => {
    this.from = from;
    return this.from;
  };

  public setOptions = (options: CallOptions) => {
    this.options = _.merge({}, this.options, options);
    return this.options;
  };

  public setNodeId = (nodeId: string) => {
    this.nodeId = nodeId;
    return this.nodeId;
  };

  public setChainId = (chainId: ChainId) => {
    this.chainId = chainId;
    return this.chainId;
  };

  public get to() {
    if (!this.chainId) throw new Error("Chain ID is required");
    return FCT_MULTICALL_ADDRESS[this.chainId];
  }

  public get params(): Param[] {
    return [
      {
        name: "calls",
        type: "Multicall[]",
        customType: true,
        value: this.calls.map((call) => {
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

  public get method() {
    return "multicall";
  }

  public get value() {
    return "0"; // For now we only support multicalls with no value
  }

  public get() {
    if (!this.from) throw new Error("From address is required");
    return {
      to: this.to,
      from: this.from,
      params: this.params,
      method: this.method,
      value: this.value,
      options: this.options,
      nodeId: this.nodeId,
    };
  }

  public getCallEIP712Types() {
    return this.calls.map((call) => [
      ...call.params.map((param) => ({
        name: param.name,
        type: param.type,
      })),
    ]);
  }

  public getEIP712MessageData() {
    return {
      calls: this.calls.map((call) => ({
        target: call.target,
        ctype: call.callType,
        method: call.method,
        data: call.params.reduce((acc, param) => {
          return { ...acc, [param.name]: param.value };
        }, {}),
      })),
    };
  }

  public generateEIP712Types() {
    return {
      [`FCTMulticall_${this.nodeId}`]: [
        { name: "target", type: "address" },
        { name: "ctype", type: "string" },
        { name: "method", type: "string" },
        { name: "data", type: `FCTMulticall_${this.nodeId}_data` },
      ],
      [`FCTMulticall_${this.nodeId}_data`]: this.calls[0].params.map((param) => ({
        name: param.name,
        type: param.type,
      })),
    };
  }
}
