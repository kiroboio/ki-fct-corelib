import Web3 from "web3";
import { ethers } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";
import Contract from "web3/eth/contract";
import { AbiItem } from "web3-utils";
import { TypedData, TypedDataUtils } from "ethers-eip712";
import { BatchCallBase, BatchFlags, MethodParamsInterface, MultiCallFlags, Params, Validator } from "./interfaces";

import FactoryProxyContractABI from "./abi/factoryProxy_.abi.json";
import ValidatorABI from "./abi/validator.abi.json";
import { MultiSigCallInputInterface } from "./batchMultiSigCall/interfaces";
import { Flow } from "./constants";

export const flows = {
  OK_CONT_FAIL_REVERT: {
    text: "continue on success, revert on fail",
    value: "1",
  },
  OK_CONT_FAIL_STOP: {
    text: "continue on success, stop on fail",
    value: "2",
  },
  OK_CONT_FAIL_JUMP: {
    text: "continue on success, jump on fail",
    value: "3",
  },
  OK_REVERT_FAIL_CONT: {
    text: "revert on success, continue on fail",
    value: "4",
  },
  OK_STOP_FAIL_CONT: {
    text: "stop on success, continue on fail",
    value: "5",
  },
  OK_JUMP_FAIL_CONT: {
    text: "jump on success, continue on fail",
    value: "6",
  },
};

// Everything for sessionId
const getGroupId = (group: number): string => group.toString(16).padStart(6, "0");
const getNonce = (nonce: number): string => nonce.toString(16).padStart(10, "0");
const getAfterTimestamp = (epochDate: number): string => epochDate.toString(16).padStart(10, "0");
const getBeforeTimestamp = (infinity: boolean, epochDate?: number): string =>
  infinity ? "ffffffffff" : epochDate.toString(16).padStart(10, "0");
const getMaxGas = (maxGas: number): string => maxGas.toString(16).padStart(8, "0");
const getMaxGasPrice = (gasPrice: number): string => gasPrice.toString(16).padStart(16, "0");

// Get Types array
export const getTypesArray = (params: Params[]) => {
  const TYPE_NATIVE = 0;
  const TYPE_STRING = 1;
  const TYPE_BYTES = 2;
  const TYPE_ARRAY = 3;
  const TYPE_STRUCT = 4;
  return params.reduce((acc, item) => {
    if (item.type === "string") {
      return [...acc, TYPE_STRING];
    }
    if (item.type === "bytes") {
      return [...acc, TYPE_BYTES];
    }
    if (item.type.lastIndexOf("[") > 0) {
      const t = item.type.slice(0, item.type.lastIndexOf("["));
      let insideType: number;
      if (t === "string") {
        insideType = TYPE_STRING;
      } else if (t === "bytes") {
        insideType = TYPE_BYTES;
      } else if (
        t === "address" ||
        t === "uint256" ||
        t === "uint8" ||
        t === "uint16" ||
        t === "uint32" ||
        t === "uint64" ||
        t === "uint128" ||
        t === "uint256"
      ) {
        insideType = TYPE_NATIVE;
      } else {
        insideType = TYPE_STRUCT;
      }

      return [...acc, TYPE_ARRAY, insideType];
    }
    return [...acc, TYPE_NATIVE];
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
export const manageCallFlags = (flags: Partial<MultiCallFlags>) => {
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

export const manageCallFlagsV2 = (flow: Flow | string, jump: number) => {
  if (jump > 15) {
    throw new Error("Jump value cannot exceed 15");
  }

  if (!flows[flow]) {
    throw new Error("Flow not found");
  }

  return `0x${flows[flow].value}${jump.toString(16)}`;
};

// From method and params create tuple
export const getMethodInterface = (call: Partial<MethodParamsInterface>) => {
  return `${call.method}(${call.params.map((item) => item.type).join(",")})`;
};

// Get typehash from typedData
export const getTypeHash = (typedData: TypedData) => {
  const m2 = TypedDataUtils.typeHash(typedData.types, typedData.primaryType);
  return ethers.utils.hexZeroPad(ethers.utils.hexlify(m2), 32);
};

// Get Typed Data domain for EIP712
export const getTypedDataDomain = async (web3: Web3, factoryProxy: Contract, factoryProxyAddress: string) => {
  const chainId = await factoryProxy.methods.CHAIN_ID().call();
  return {
    name: await factoryProxy.methods.NAME().call(), // await factoryProxy.NAME(),
    version: await factoryProxy.methods.VERSION().call(), // await factoryProxy.VERSION(),
    chainId: Number("0x" + web3.utils.toBN(chainId).toString("hex")), // await web3.eth.getChainId(),
    verifyingContract: factoryProxyAddress,
    salt: await factoryProxy.methods.uid().call(),
  };
};

//
// METHOD HELPERS FOR FCTs
//

const handleValues = (value: string | string[], type: string) => {
  if (type === "bytes" || type === "string") {
    let v: Uint8Array;
    if (type === "string") {
      v = ethers.utils.toUtf8Bytes(value as string);
    } else {
      v = ethers.utils.arrayify(value as string);
    }

    return ethers.utils.arrayify(ethers.utils.hexZeroPad(ethers.utils.keccak256(v), 32));
  }
  if (type.lastIndexOf("[") > 0) {
    const values = value as string[];
    const t = type.slice(0, type.lastIndexOf("["));
    const v = values.map((item) => handleValues(item, t));
    return ethers.utils.arrayify(
      ethers.utils.keccak256(
        ethers.utils.arrayify(
          defaultAbiCoder.encode(
            v.map(() => t),
            v.map((value) => value)
          )
        )
      )
    );
  }
  return value;
};

export const getEncodedMethodParams = (call: Partial<MethodParamsInterface>, withFunction?: boolean) => {
  if (!call.method) return "0x";

  if (withFunction) {
    const web3 = new Web3();
    return web3.eth.abi.encodeFunctionCall(
      {
        name: call.method,
        type: "function",
        inputs: call.params.map((param) => ({
          type: param.type,
          name: param.name,
        })),
      },
      call.params.map((param) => param.value as string)
    );
  }

  const types = call.params.map((param) => {
    // if (param.type === "bytes" || param.type === "string" || param.type.lastIndexOf("[") > 0) {
    //   return "bytes32";
    // }
    return param.type;
  });

  // const values = call.params.map((param) => handleValues(param.value, param.type));
  const values = call.params.map((param) => param.value);

  return defaultAbiCoder.encode(types, values);
};

export const generateTxType = (item: Partial<MethodParamsInterface>) => {
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

export const getParamsLength = (encodedParams: string) => {
  const paramsLength = defaultAbiCoder.encode(["bytes"], [encodedParams]).slice(66, 66 + 64);
  return `0x${paramsLength}`;
};

export const getParamsOffset = () => {
  return `0x0000000000000000000000000000000000000000000000000000000000000060`;
};
//
//  END OF METHOD HELPERS FOR FCTs
//

export const getFactoryProxyContract = (web3: Web3, proxyContractAddress: string) => {
  const proxyContract = new web3.eth.Contract(FactoryProxyContractABI as AbiItem[], proxyContractAddress);
  return proxyContract;
};

// Returns web3 transaction object
export const getTransaction = (web3: Web3, address: string, method: string, params: any[]) => {
  const factoryProxyContract = getFactoryProxyContract(web3, address);
  return factoryProxyContract.methods[method](...params);
};

//
// VALIDATOR FUNCTION HELPERS
//

export const getValidatorFunctionData = (validator: Validator, params: any[]) => {
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

export const getValidatorMethodInterface = (validator: Validator) => {
  const iface = new ethers.utils.Interface(ValidatorABI);
  const validatorFunction = iface.getFunction(validator.method);

  if (!validatorFunction) {
    throw new Error(`Method ${validator.method} not found in Validator ABI`);
  }

  return `${validator.method}(${validatorFunction.inputs.map((item) => item.type).join(",")})`;
};

export const getValidatorData = (call: Partial<MultiSigCallInputInterface>, noFunctionSignature: boolean) => {
  const iface = new ethers.utils.Interface(ValidatorABI);
  const data = iface.encodeFunctionData(call.validator.method, [
    ...Object.values(call.validator.params),
    call.to,
    ethers.utils.keccak256(ethers.utils.toUtf8Bytes(getMethodInterface(call))),
    getEncodedMethodParams(call),
  ]);

  return noFunctionSignature ? `0x${data.slice(10)}` : data;
};

const getValidatorDataOffset = (types: string[], data: string) => {
  return `0x${defaultAbiCoder
    .encode(types, [...types.slice(0, -1).map((item) => "0x" + "0".repeat(64)), data])
    .slice(64 * types.slice(0, -1).length + 2, 64 * types.length + 2)}`;
};

export const createValidatorTxData = (call: Partial<MultiSigCallInputInterface>) => {
  const iface = new ethers.utils.Interface(ValidatorABI);
  const validatorFunction = iface.getFunction(call.validator.method);
  let validator = call.validator;

  if (!validatorFunction) {
    throw new Error(`Method ${validator.method} not found in Validator ABI`);
  }

  // const encodedData = getValidatorData(call, true);

  const methodDataOffsetTypes = [
    ...[...Array(validatorFunction.inputs.length - 1).keys()].map(() => "bytes32"),
    "bytes",
  ];

  return {
    // validation_data_offset: getValidatorDataOffset(["bytes32", "bytes32", "bytes"], encodedData), // 0x60
    // validation_data_length: getParamsLength(encodedData),
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
