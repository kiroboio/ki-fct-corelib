import { utils } from "ethers";

import { nullValue } from "../../constants";
import { getEncodedMethodParams, getMethodInterface, getTypedHashes, getTypesArray } from "../../helpers";
import { BatchMultiSigCallTypedData, IMSCallInput } from "../types";

export const handleMethodInterface = (call: IMSCallInput): string => {
  if (call.method) {
    return getMethodInterface(call);
  }

  return "";
};

export const handleFunctionSignature = (call: IMSCallInput) => {
  if (call.method) {
    const value = getMethodInterface(call);
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
  return getEncodedMethodParams(call);
};

export const handleTypes = (call: IMSCallInput) => {
  if (call.params) {
    return getTypesArray(call.params);
  }
  return [];
};

export const handleTypedHashes = (call: IMSCallInput, typedData: BatchMultiSigCallTypedData) => {
  if (call.params) {
    return getTypedHashes(call.params, typedData);
  }
  return [];
};