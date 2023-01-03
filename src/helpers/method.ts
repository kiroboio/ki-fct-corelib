import { utils } from "ethers";
import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";

import { MethodParamsInterface, Param } from "../types";
import { instanceOfParams } from "./instanceOf";

// From method and params create tuple
export const getMethodInterface = (call: Partial<MethodParamsInterface>): string => {
  const getParamsType = (param: Param): string => {
    if (instanceOfParams(param.value)) {
      if (Array.isArray(param.value[0])) {
        const value = param.value[0] as Param[];
        return `(${value.map(getParamsType).join(",")})[]`;
      } else {
        const value = param.value as Param[];
        return `(${value.map(getParamsType).join(",")})`;
      }
    }

    return param.hashed ? "bytes32" : param.type;
  };
  const params = call.params.map(getParamsType);

  return `${call.method}(${params})`;
};

export const getEncodedMethodParams = (call: Partial<MethodParamsInterface>, withFunction?: boolean): string => {
  if (!call.method) return "0x";

  if (withFunction) {
    const ABI = [
      `function ${call.method}(${call.params.map((item) => (item.hashed ? "bytes32" : item.type)).join(",")})`,
    ];

    const iface = new utils.Interface(ABI);
    return iface.encodeFunctionData(
      call.method,
      call.params.map((item) => {
        if (item.hashed) {
          if (typeof item.value === "string") {
            return utils.keccak256(toUtf8Bytes(item.value));
          }
          throw new Error("Hashed value must be a string");
        }
        return item.value;
      })
    );
  }

  const getType = (param: Param) => {
    if (param.customType || param.type.includes("tuple")) {
      let value: Param[];
      let isArray = false;
      if (param.type.lastIndexOf("[") > 0) {
        isArray = true;
        value = param.value[0] as Param[];
      } else {
        value = param.value as Param[];
      }
      return `(${value.map(getType).join(",")})${isArray ? "[]" : ""}`;
    }
    return param.hashed ? "bytes32" : param.type;
  };

  const getValues = (param: Param) => {
    if (param.customType || param.type.includes("tuple")) {
      let value;
      if (param.type.lastIndexOf("[") > 0) {
        value = param.value as Param[][];
        return value.reduce((acc, val) => {
          return [...acc, val.map(getValues)];
        }, []);
      } else {
        value = param.value as Param[];
        return value.map(getValues);
      }
    }

    if (param.hashed) {
      if (typeof param.value === "string") {
        console.log("Hashed", utils.keccak256(toUtf8Bytes(param.value)));
        return utils.keccak256(toUtf8Bytes(param.value));
      }
      throw new Error("Hashed value must be a string");
    }

    return param.value;
  };

  return defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};

export const getParamsLength = (encodedParams: string): string => {
  const paramsLength = defaultAbiCoder.encode(["bytes"], [encodedParams]).slice(66, 66 + 64);
  return `0x${paramsLength}`;
};
