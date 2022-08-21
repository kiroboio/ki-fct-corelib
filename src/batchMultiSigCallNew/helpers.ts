import { utils } from "ethers";
import { TypedData } from "ethers-eip712";
import { MSCallOptions } from "./interfaces";
import {
  getEncodedMethodParams,
  getMethodInterface,
  getTypedHashes,
  getTypesArray,
  getValidatorData,
  getValidatorMethodInterface,
} from "../helpers";
import { MSCallInput } from "./interfaces";

const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";

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

export const getSessionId = (salt: string, options: MSCallOptions) => {
  // 6 - Salt
  // 2 - External signers
  // 6 - Version
  // 4 - Recurrent
  // 8 - Chill time
  // 10 - After timestamp
  // 10 - Before timestamp
  // 16 - Gas price limit
  // 2 - Flags

  const externalSigners = options.multisig
    ? options.multisig.externalSigners.length.toString(16).padStart(2, "0")
    : "00";
  const version = "010101";
  const recurrent = options.recurrency ? Number(options.recurrency.maxRepeats).toString(16).padStart(4, "0") : "0000";
  const chillTime = options.recurrency
    ? Number(options.recurrency.chillTime).toString(16).padStart(8, "0")
    : "00000000";
  const afterTimestamp = options.validFrom ? Number(options.validFrom).toString(16).padStart(10, "0") : "0000000000";
  const beforeTimestamp = options.expiresAt ? Number(options.expiresAt).toString(16).padStart(10, "0") : "ffffffffff";
  const gasPriceLimit = options.maxGasPrice
    ? Number(options.maxGasPrice).toString(16).padStart(16, "0")
    : "00000005D21DBA00"; // 25 Gwei

  const flags = `10`; // Have to implement getFlags function

  return `0x${salt}${externalSigners}${version}${recurrent}${chillTime}${afterTimestamp}${beforeTimestamp}${gasPriceLimit}${flags}`;
};
