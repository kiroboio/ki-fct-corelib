import { ethers } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import { TypedData, TypedDataTypes, TypedDataUtils } from "ethers-eip712";
import { BatchCallBase, BatchFlags, MethodParamsInterface, MultiCallFlags, Params, Validator } from "./interfaces";

import ValidatorABI from "./abi/validator.abi.json";
import { IMSCallInput, TypedDataDomain } from "./batchMultiSigCall/interfaces";
import { Flow } from "./constants";

export const flows = {
  OK_CONT_FAIL_REVERT: {
    text: "continue on success, revert on fail",
    value: "0",
  },
  OK_CONT_FAIL_STOP: {
    text: "continue on success, stop on fail",
    value: "1",
  },
  OK_CONT_FAIL_CONT: {
    text: "continue on success, continue on fail",
    value: "2",
  },
  OK_REVERT_FAIL_CONT: {
    text: "revert on success, continue on fail",
    value: "3",
  },
  OK_REVERT_FAIL_STOP: {
    text: "revert on success, stop on fail",
    value: "4",
  },
  OK_STOP_FAIL_CONT: {
    text: "stop on success, continue on fail",
    value: "5",
  },
  OK_STOP_FAIL_REVERT: {
    text: "stop on success, revert on fail",
    value: "6",
  },
  OK_STOP_FAIL_STOP: {
    text: "stop on success, stop on fail",
    value: "7",
  },
};

function instanceOfParams(objectOrArray: any): objectOrArray is Params | Params[] {
  if (Array.isArray(objectOrArray)) {
    return instanceOfParams(objectOrArray[0]);
  }

  return typeof objectOrArray === "object" && "type" in objectOrArray;
}

// Everything for sessionId
const getGroupId = (group: number): string => group.toString(16).padStart(6, "0");
const getNonce = (nonce: number): string => nonce.toString(16).padStart(10, "0");
const getAfterTimestamp = (epochDate: number): string => epochDate.toString(16).padStart(10, "0");
const getBeforeTimestamp = (infinity: boolean, epochDate?: number): string =>
  infinity ? "ffffffffff" : epochDate.toString(16).padStart(10, "0");
const getMaxGas = (maxGas: number): string => maxGas.toString(16).padStart(8, "0");
const getMaxGasPrice = (gasPrice: number): string => gasPrice.toString(16).padStart(16, "0");

const TYPE_NATIVE = 1000;
const TYPE_STRING = 2000;
const TYPE_BYTES = 3000;
const TYPE_ARRAY = 4000;
const TYPE_ARRAY_WITH_LENGTH = 5000;

const typeValue = (param: Params): number[] => {
  // return [];

  // If type is an array
  if (param.type.lastIndexOf("[") > 0) {
    if (param.customType || param.type.includes("tuple")) {
      const value = param.value as Params[][];
      return [TYPE_ARRAY, value.length, ...getTypesArray(param.value[0] as Params[])];
    }

    const parameter = { ...param, type: param.type.slice(0, param.type.lastIndexOf("[")) };
    const insideType = typeValue(parameter);

    const type = param.type.indexOf("]") - param.type.indexOf("[") === 1 ? TYPE_ARRAY : TYPE_ARRAY_WITH_LENGTH;

    return [type, ...insideType];
  }

  // If type is a string
  if (param.type === "string") {
    return [TYPE_STRING];
  }

  // If type is bytes
  if (param.type === "bytes") {
    return [TYPE_BYTES];
  }

  // If param is custom struct
  if (param.customType || param.type.includes("tuple")) {
    const values = param.value as Params[];

    return [
      values.length,
      ...values.reduce((acc, item) => {
        return [...acc, ...typeValue(item)];
      }, []),
    ];
  }

  // If all statements above are false, then type is a native type
  return [TYPE_NATIVE];
};

// Get Types array
export const getTypesArray = (params: Params[]): number[] => {
  const types = params.reduce((acc, item) => {
    const data = typeValue(item);
    return [...acc, ...data];
  }, []);

  return types.some((item) => item !== TYPE_NATIVE) ? types : [];
};

export const getTypedHashes = (params: Params[], typedData: { types: TypedDataTypes }): string[] => {
  return params.reduce((acc, item) => {
    if (item.customType) {
      const type = item.type.lastIndexOf("[") > 0 ? item.type.slice(0, item.type.lastIndexOf("[")) : item.type;
      return [...acc, ethers.utils.hexlify(ethers.utils.hexlify(TypedDataUtils.typeHash(typedData.types, type)))];
    }
    return acc;
  }, []);
};

// Get session id with all the details
export const getSessionIdDetails = (call: BatchCallBase, defaultFlags: Partial<BatchFlags>, smallFlags: boolean) => {
  const group = getGroupId(call.groupId);
  const nonce = getNonce(call.nonce);
  const after = getAfterTimestamp(call.afterTimestamp || 0);
  const before = call.beforeTimestamp ? getBeforeTimestamp(false, call.beforeTimestamp) : getBeforeTimestamp(true);
  const gasLimit = getMaxGas(call.gasLimit || 0);
  const maxGasPrice = call.maxGasPrice ? getMaxGasPrice(call.maxGasPrice) : "00000005D21DBA00"; // 25 Gwei

  const pureFlags = { ...defaultFlags, ...call.flags };
  const flags = getFlags(pureFlags, smallFlags);

  return {
    group,
    nonce,
    after,
    before,
    gasLimit,
    maxGasPrice,
    flags,
    pureFlags,
    sessionId: `0x${group}${nonce}${after}${before}${gasLimit}${maxGasPrice}${flags}`,
  };
};

// Get batch flags
export const getFlags = (flags: Partial<BatchFlags>, small: boolean) => {
  const array = ["0", "0", "0", "0"];
  if (flags.eip712 || flags.viewOnly || flags.cancelable) {
    array[1] = flags.cancelable ? "8" : flags.viewOnly ? "4" : "1";
  }
  array[0] = flags.payment ? "f" : "0";
  if (flags.flow) {
    array[2] = "f";
    array[3] = "f";
  }

  return small ? array.slice(0, 2).join("") : array.join("");
};

// Get flags for single call in multicalls
export const manageCallFlags = (flags: Partial<MultiCallFlags>): string => {
  const array = ["0", "x", "0", "0"];
  if (flags.onFailContinue && flags.onFailStop) {
    throw new Error("Both flags onFailContinue and onFailStop can't be enabled at once");
  }
  if (flags.onSuccessRevert && flags.onSuccessStop) {
    throw new Error("Both flags onSuccessRevert and onSuccessStop can't be enabled at once");
  }
  array[2] = flags.onSuccessRevert ? "2" : flags.onSuccessRevert ? "1" : "0";
  array[3] = flags.onFailContinue ? "2" : flags.onFailStop ? "1" : "0";

  return array.join("");
};

export const manageCallFlagsV2 = (flow: Flow | string, jump: number): string => {
  if (jump > 15) {
    throw new Error("Jump value cannot exceed 15");
  }

  if (!flows[flow]) {
    throw new Error("Flow not found");
  }

  return `0x${flows[flow].value}${jump.toString(16)}`;
};

// From method and params create tuple
export const getMethodInterface = (call: Partial<MethodParamsInterface>): string => {
  const getParamsType = (param: Params): string => {
    if (instanceOfParams(param.value)) {
      if (Array.isArray(param.value[0])) {
        const value = param.value[0] as Params[];
        return `(${value.map(getParamsType).join(",")})[]`;
      } else {
        const value = param.value as Params[];
        return `(${value.map(getParamsType).join(",")})`;
      }
    }

    return param.type;
  };
  const params = call.params.map(getParamsType);

  return `${call.method}(${params})`;
};

// Get typehash from typedData
export const getTypeHash = (typedData: TypedData): string => {
  const m2 = TypedDataUtils.typeHash(typedData.types, typedData.primaryType);
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(m2), 32);
};

// Get Typed Data domain for EIP712
export const getTypedDataDomain = async (factoryProxy: ethers.Contract): Promise<TypedDataDomain> => {
  const chainId = await factoryProxy.CHAIN_ID();
  return {
    name: await factoryProxy.NAME(),
    version: await factoryProxy.VERSION(),
    chainId: chainId.toNumber(),
    verifyingContract: factoryProxy.address,
    salt: await factoryProxy.UID(),
  };
};

export const getEncodedMethodParams = (call: Partial<MethodParamsInterface>, withFunction?: boolean): string => {
  if (!call.method) return "0x";

  if (withFunction) {
    const ABI = [`function ${call.method}(${call.params.map((item) => item.type).join(",")})`];

    const iface = new ethers.utils.Interface(ABI);
    return iface.encodeFunctionData(
      call.method,
      call.params.map((item) => item.value)
    );
  }

  const getType = (param: Params) => {
    if (param.customType || param.type.includes("tuple")) {
      let value;
      let isArray = false;
      if (param.type.lastIndexOf("[") > 0) {
        isArray = true;
        value = param.value[0] as Params[];
      } else {
        value = param.value as Params[];
      }
      return `(${value.map(getType).join(",")})${isArray ? "[]" : ""}`;
    }
    return param.type;
  };

  const getValues = (param: Params) => {
    if (param.customType || param.type.includes("tuple")) {
      let value;
      if (param.type.lastIndexOf("[") > 0) {
        value = param.value as Params[][];
        return value.reduce((acc, val) => {
          return [...acc, val.map(getValues)];
        }, []);
      } else {
        value = param.value as Params[];
        return value.map(getValues);
      }
    }

    return param.value;
  };

  return defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};

export const generateTxType = (item: Partial<MethodParamsInterface>): { name: string; type: string }[] => {
  const defaults = [{ name: "details", type: "Transaction_" }];

  if (item.params) {
    if (item.validator) {
      return [{ name: "details", type: "Transaction_" }, ...getValidatorFunctionData(item.validator, item.params)];
    }
    const types = item.params.reduce((acc, param) => {
      return [...acc, { name: param.name, type: param.type }];
    }, []);

    return [...defaults, ...types];
  }

  return [{ name: "details", type: "Transaction_" }];
};

export const getParamsLength = (encodedParams: string): string => {
  const paramsLength = defaultAbiCoder.encode(["bytes"], [encodedParams]).slice(66, 66 + 64);
  return `0x${paramsLength}`;
};

export const getParamsOffset = () => {
  return `0x0000000000000000000000000000000000000000000000000000000000000060`;
};
//
//  END OF METHOD HELPERS FOR FCTs
//

//
// VALIDATOR FUNCTION HELPERS
//

export const getValidatorFunctionData = (validator: Validator, params: any[]): { name: string; type: string }[] => {
  const iface = new ethers.utils.Interface(ValidatorABI);
  const validatorFunction = iface.getFunction(validator.method);

  return validatorFunction.inputs.reduce((acc, item) => {
    if (item.type === "bytes" && item.name === "data") {
      return [
        ...acc,
        { name: "method_data_offset", type: "uint256" },
        { name: "method_data_length", type: "uint256" },
        ...params.map((param) => ({ name: param.name, type: param.type })),
      ];
    }
    return [...acc, { name: item.name, type: item.type === "bytes32" ? "string" : item.type }];
  }, []);
};

export const getValidatorMethodInterface = (validator: Validator): string => {
  const iface = new ethers.utils.Interface(ValidatorABI);
  const validatorFunction = iface.getFunction(validator.method);

  if (!validatorFunction) {
    throw new Error(`Method ${validator.method} not found in Validator ABI`);
  }

  return `${validator.method}(${validatorFunction.inputs.map((item) => item.type).join(",")})`;
};

export const getValidatorData = (call: Partial<IMSCallInput>, noFunctionSignature: boolean): string => {
  const iface = new ethers.utils.Interface(ValidatorABI);
  const data = iface.encodeFunctionData(call.validator.method, [
    ...Object.values(call.validator.params),
    call.to,
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(getMethodInterface(call))),
    getEncodedMethodParams(call),
  ]);

  return noFunctionSignature ? `0x${data.slice(10)}` : data;
};

const getValidatorDataOffset = (types: string[], data: string): string => {
  return `0x${defaultAbiCoder
    .encode(types, [...types.slice(0, -1).map(() => "0x" + "0".repeat(64)), data])
    .slice(64 * types.slice(0, -1).length + 2, 64 * types.length + 2)}`;
};

export const createValidatorTxData = (call: Partial<IMSCallInput>): object | Error => {
  const iface = new ethers.utils.Interface(ValidatorABI);
  const validatorFunction = iface.getFunction(call.validator.method);
  const validator = call.validator;

  if (!validatorFunction) {
    throw new Error(`Method ${validator.method} not found in Validator ABI`);
  }

  // const encodedData = getValidatorData(call, true);

  const methodDataOffsetTypes = [
    ...[...Array(validatorFunction.inputs.length - 1).keys()].map(() => "bytes32"),
    "bytes",
  ];

  return {
    ...validator.params,
    contractAddress: call.to,
    functionSignature: getMethodInterface(call),
    method_data_offset: getValidatorDataOffset(methodDataOffsetTypes, getEncodedMethodParams(call)),
    method_data_length: getParamsLength(getEncodedMethodParams(call)),
    ...call.params.reduce(
      (acc, param) => ({
        ...acc,
        [param.name]: param.value,
      }),
      {}
    ),
  };
};
