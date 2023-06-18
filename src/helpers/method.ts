import { utils } from "ethers";

import { MethodParamsInterface, Param } from "../types";
import { InstanceOf } from "./instanceOf";

const { toUtf8Bytes, defaultAbiCoder } = utils;

type GetValueType = boolean | string | GetValueType[] | GetValueType[][];

const buildInputsFromParams = (params: Param[]): { type: string; name: string }[] => {
  return params.map((param) => {
    if (InstanceOf.Param(param.value)) {
      return { type: "tuple", name: param.name, components: buildInputsFromParams(param.value) };
    } else if (InstanceOf.ParamArray(param.value)) {
      return { type: "tuple[]", name: param.name, components: buildInputsFromParams(param.value[0]) };
    }

    return { type: param.hashed ? "bytes32" : param.type, name: param.name };
  });
};

// From method and params create tuple
// This version creates a ABI and gets the interface from it in ethers and then encodes the function bytes4
export const getMethodInterface = (call: { method: string; params?: Param[] }): string => {
  const ABI = [
    {
      name: call.method,
      type: "function",
      constant: false,
      payable: false,
      inputs: buildInputsFromParams(call.params || []),
      outputs: [],
    },
  ];

  return new utils.Interface(ABI).getFunction(call.method).format();
};

export const getEncodedMethodParams = (call: Partial<MethodParamsInterface>): string => {
  if (!call.method) return "0x";

  // if (withFunction) {
  //   const ABI = [
  //     `function ${call.method}(${
  //       call.params ? call.params.map((item) => (item.hashed ? "bytes32" : item.type)).join(",") : ""
  //     })`,
  //   ];
  //
  //   const iface = new utils.Interface(ABI);
  //   return iface.encodeFunctionData(
  //     call.method,
  //     call.params
  //       ? call.params.map((item) => {
  //           if (item.hashed) {
  //             if (typeof item.value === "string") {
  //               return utils.keccak256(toUtf8Bytes(item.value));
  //             }
  //             throw new Error("Hashed value must be a string");
  //           }
  //           return item.value;
  //         })
  //       : []
  //   );
  // }

  const getType = (param: Param): string => {
    if (param.customType || param.type.includes("tuple")) {
      let value: Param[];
      let isArray = false;
      if (param.type.lastIndexOf("[") > 0) {
        isArray = true;
        value = (param.value as Param[][])[0];
      } else {
        value = param.value as Param[];
      }
      return `(${value.map(getType).join(",")})${isArray ? "[]" : ""}`;
    }
    return param.hashed ? "bytes32" : param.type;
  };

  const getValues = (param: Param): GetValueType => {
    if (!param.value) {
      throw new Error("Param value is required");
    }
    if (param.customType || param.type.includes("tuple")) {
      let value;
      if (param.type.lastIndexOf("[") > 0) {
        value = param.value as Param[][];
        return value.reduce((acc, val) => {
          return [...acc, val.map(getValues)];
        }, [] as GetValueType[][]);
      } else {
        value = param.value as Param[];
        return value.map(getValues);
      }
    }

    if (param.hashed) {
      if (typeof param.value === "string") {
        return utils.keccak256(toUtf8Bytes(param.value));
      }
      throw new Error("Hashed value must be a string");
    }

    return param.value as boolean | string;
  };
  if (!call.params) return "0x";

  return defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};
