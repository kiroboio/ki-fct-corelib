import { BatchMultiSigCallNew } from ".";
import {
  getEncodedMethodParams,
  getMethodInterface,
  getTypedHashes,
  getTypesArray,
  getValidatorData,
  getValidatorMethodInterface,
} from "../helpers";
import { BatchMSCallInput, MSCallInput } from "./interfaces";
import { utils } from "ethers";
import { TypedData } from "ethers-eip712";

const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

export const handleTo = (self: BatchMultiSigCallNew, call: MSCallInput) => {
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

export const handleMethodInterface = (call: MSCallInput): string => {
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

export const handleFunctionSignature = (call: MSCallInput) => {
  if (call.method) {
    const value = call.validator ? getValidatorMethodInterface(call.validator) : getMethodInterface(call);
    return utils.id(value);
  }
  return nullValue;
};

export const handleEnsHash = (call: MSCallInput) => {
  if (call.toEnsHash) {
    return utils.id(call.toEnsHash);
  }
  return nullValue;
};

export const handleData = (call: MSCallInput) => {
  if (call.validator) {
    return getValidatorData(call, true);
  }

  return getEncodedMethodParams(call);
};

export const handleTypes = (call: MSCallInput) => {
  if (call.params) {
    return getTypesArray(call.params);
  }
  return [];
};

export const handleTypedHashes = (call: MSCallInput, typedData: TypedData) => {
  if (call.params) {
    return getTypedHashes(call.params, typedData);
  }
  return [];
};

export const getSessionId = (salt: string, batchCall: BatchMSCallInput) => {
  // 6 - Salt
  // 2 - External signers
  // 6 - Version
  // 4 - Recurrent
  // 8 - Chill time
  // 10 - After timestamp
  // 10 - Before timestamp
  // 16 - Gas price limit

  const externalSigners = batchCall.multisig ? String(batchCall.multisig.externalSigners).padStart(2, "0") : "00";
  const version = "010101";
  const recurrent = batchCall.recurrency ? String(batchCall.recurrency.maxRepeats).padStart(4, "0") : "0000";
  const chillTime = batchCall.recurrency ? String(batchCall.recurrency.chillTime).padStart(8, "0") : "00000000";
  const afterTimestamp = batchCall.validFrom ? String(batchCall.validFrom).padStart(10, "0") : "0000000000";
  const beforeTimestamp = batchCall.expiresAt ? String(batchCall.expiresAt).padStart(10, "0") : "ffffffffff";
  const gasPriceLimit = batchCall.gasPriceLimit
    ? String(batchCall.gasPriceLimit).padStart(16, "0")
    : "0000000000000000";

  return `0x${salt}${externalSigners}${version}${recurrent}${chillTime}${afterTimestamp}${beforeTimestamp}${gasPriceLimit}`;
};
