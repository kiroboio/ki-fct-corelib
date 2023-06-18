import _ from "lodash";

import { Param, StrictMSCallInput } from "../../../../types";
import * as helpers from "./helpers";

type EIP712TypesObject = Record<string, { name: string; type: string }[]>;

export class EIP712StructTypes {
  transactionTypes: EIP712TypesObject = {};
  structTypes: EIP712TypesObject = {};

  static helpers = helpers;

  constructor(calls: StrictMSCallInput[]) {
    calls.forEach((call, index: number) => {
      if (call.multicall) {
        _.merge(this.structTypes, call.multicall.generateEIP712Types());
        this.transactionTypes[`transaction${index + 1}`] = [
          { name: "call", type: "Call" },
          { name: "calls", type: `FCTMulticall_${call.multicall.nodeId}[]` },
        ];
        return;
      }

      const values = call.params
        ? call.params.map((param: Param) => {
            if (param.customType || param.type === "tuple") {
              const type = this.getStructType(param, index);
              return { name: param.name, type: param.type.lastIndexOf("[") > 0 ? `${type}[]` : type };
            }
            return {
              name: param.name,
              type: param.type,
            };
          })
        : [];

      this.transactionTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
    });
  }

  getTypeCount = () => Object.values(this.structTypes).length + 1;

  getStructType = (param: Param, index: number) => {
    const typeName = `Struct${this.getTypeCount()}`;

    let paramValue: Param[] | Param[][];

    if (helpers.isInstanceOfTupleArray(param.value, param)) {
      paramValue = param.value[0];
    } else if (helpers.isInstanceOfTuple(param.value, param)) {
      paramValue = param.value;
    } else {
      throw new Error(`Invalid param value: ${param.value} for param: ${param.name}`);
    }

    let customCount = 0;

    this.structTypes[typeName] = paramValue.map((item) => {
      if (item.customType || item.type.includes("tuple")) {
        ++customCount;
        const innerTypeName = `Struct${this.getTypeCount() + customCount}`;
        return {
          name: item.name,
          type: innerTypeName,
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
          this.getStructType(parameter, index);
        }
      }
    } else {
      for (const parameter of param.value as Param[]) {
        if (parameter.customType || parameter.type.includes("tuple")) {
          this.getStructType(parameter, index);
        }
      }
    }

    return typeName;
  };
}
