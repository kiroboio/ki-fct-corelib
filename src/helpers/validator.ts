import { IMSCallInput } from "../batchMultiSigCall/interfaces";
import { utils } from "ethers";
import { defaultAbiCoder } from "ethers/lib/utils";

import { Validator } from "../interfaces";
import ValidatorABI from "../abi/validator.abi.json";
import { getEncodedMethodParams, getMethodInterface, getParamsLength } from "./method";

export const getValidatorFunctionData = (validator: Validator, params: any[]): { name: string; type: string }[] => {
  const iface = new utils.Interface(ValidatorABI);
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
  const iface = new utils.Interface(ValidatorABI);
  const validatorFunction = iface.getFunction(validator.method);

  if (!validatorFunction) {
    throw new Error(`Method ${validator.method} not found in Validator ABI`);
  }

  return `${validator.method}(${validatorFunction.inputs.map((item) => item.type).join(",")})`;
};

export const getValidatorData = (call: Partial<IMSCallInput>, noFunctionSignature: boolean): string => {
  const iface = new utils.Interface(ValidatorABI);
  const data = iface.encodeFunctionData(call.validator.method, [
    ...Object.values(call.validator.params),
    call.to,
    utils.keccak256(utils.toUtf8Bytes(getMethodInterface(call))),
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
  const iface = new utils.Interface(ValidatorABI);
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