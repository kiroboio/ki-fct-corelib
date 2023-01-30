import { MessageTypeProperty, TypedMessage } from "@metamask/eth-sig-util";
import { utils } from "ethers";

import { nullValue } from "../../constants";
import {
  getEncodedMethodParams,
  getMethodInterface,
  getTypedHashes,
  getTypesArray,
  getValidatorData,
  getValidatorMethodInterface,
} from "../../helpers";
import { IMSCallInput } from "../types";

export const handleMethodInterface = (call: IMSCallInput): string => {
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

export const handleFunctionSignature = (call: IMSCallInput) => {
  if (call.method) {
    const value = call.validator ? getValidatorMethodInterface(call.validator) : getMethodInterface(call);
    return utils.id(value);
  }
  return nullValue;
};

export const handleEnsHash = (call: IMSCallInput) => {
  if (call.toENS) {
    return utils.id(call.toENS);
  }
  return nullValue;
};

export const handleData = (call: IMSCallInput) => {
  if (call.validator) {
    return getValidatorData(call, true);
  }

  return getEncodedMethodParams(call);
};

export const handleTypes = (call: IMSCallInput) => {
  if (call.params) {
    return getTypesArray(call.params);
  }
  return [];
};

export const handleTypedHashes = (
  call: IMSCallInput,
  typedData: TypedMessage<Record<"EIP712Domain" & string, MessageTypeProperty[]>>
) => {
  if (call.params) {
    return getTypedHashes(call.params, typedData);
  }
  return [];
};
