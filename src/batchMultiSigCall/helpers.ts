import { BatchMultiSigCall } from ".";
import {
  getEncodedMethodParams,
  getFlags,
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

export const handleTo = (self: BatchMultiSigCall, call: MSCallInput) => {
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
  // 2 - Flags

  const externalSigners = batchCall.multisig
    ? batchCall.multisig.externalSigners.length.toString(16).padStart(2, "0")
    : "00";
  const version = "010101";
  const recurrent = batchCall.recurrency
    ? Number(batchCall.recurrency.maxRepeats).toString(16).padStart(4, "0")
    : "0000";
  const chillTime = batchCall.recurrency
    ? Number(batchCall.recurrency.chillTime).toString(16).padStart(8, "0")
    : "00000000";
  const afterTimestamp = batchCall.validFrom
    ? Number(batchCall.validFrom).toString(16).padStart(10, "0")
    : "0000000000";
  const beforeTimestamp = batchCall.expiresAt
    ? Number(batchCall.expiresAt).toString(16).padStart(10, "0")
    : "ffffffffff";
  const gasPriceLimit = batchCall.gasPriceLimit
    ? Number(batchCall.gasPriceLimit).toString(16).padStart(16, "0")
    : "00000005D21DBA00"; // 25 Gwei

  // Flags needs to be updated - currently only support for one flag (payment/repay)
  const flags = `1${batchCall.flags && batchCall.flags.payment ? "1" : "0"}`;

  return `0x${salt}${externalSigners}${version}${recurrent}${chillTime}${afterTimestamp}${beforeTimestamp}${gasPriceLimit}${flags}`;
};
