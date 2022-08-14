import { BatchMultiSigCallNew } from ".";
import {
  getEncodedMethodParams,
  getMethodInterface,
  getTypedHashes,
  getTypesArray,
  getValidatorData,
  getValidatorMethodInterface,
} from "../helpers";
import { MultiSigCallInputInterface } from "./interfaces";
import { utils } from "ethers";

const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

export const handleTo = (self: BatchMultiSigCallNew, call: MultiSigCallInputInterface) => {
  // If call is a validator method, return validator address as to address
  if (call.validator) {
    return call.validator.validatorAddress;
  }

  // Check if to is a valid address
  if (utils.isAddress(call.to)) {
    return call.to;
  }

  // Else it is a variable
  return self.getVariableFCValue(call.to);
};

export const handleMethodInterface = (call: MultiSigCallInputInterface): string => {
  // If call is not a ETH transfer
  if (call.method) {
    // If call is a validation call
    if (call.validator) {
      return getValidatorMethodInterface(call.validator);
    }

    // Else it's a standard method interface
    return getMethodInterface(call);
  }

  // Else it's a ETH transfer
  return "";
};

export const handleFunctionSignature = (call: MultiSigCallInputInterface) => {
  if (call.method) {
    const value = call.validator ? getValidatorMethodInterface(call.validator) : getMethodInterface(call);
    return utils.id(value);
  }
  return nullValue;
};

export const handleEnsHash = (call: MultiSigCallInputInterface) => {
  if (call.toEnsHash) {
    return utils.id(call.toEnsHash);
  }
  return nullValue;
};

export const handleData = (call: MultiSigCallInputInterface) => {
  if (call.validator) {
    return getValidatorData(call, true);
  }

  return getEncodedMethodParams(call);
};

export const handleTypes = (call: MultiSigCallInputInterface) => {
  if (call.params) {
    return getTypesArray(call.params);
  }
  return [];
};

export const handleTypedHashes = (call: MultiSigCallInputInterface, typedData) => {
  if (call.params) {
    return getTypedHashes(call.params, typedData);
  }
  return [];
};
