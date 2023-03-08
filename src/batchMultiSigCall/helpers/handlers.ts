import { utils } from "ethers";

import { nullValue } from "../../constants";
import { getEncodedMethodParams, getMethodInterface, getTypesArray } from "../../helpers";
import { IMSCallInput } from "../types";

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

export const handleData = (call: IMSCallInput) => {
  return getEncodedMethodParams(call);
};

export const handleTypes = (call: IMSCallInput) => {
  if (call.params) {
    return getTypesArray(call.params);
  }
  return [];
};
