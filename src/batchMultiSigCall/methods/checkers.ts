import { utils } from "ethers";

import { CALL_TYPE } from "../../constants";
import { IMSCallInput } from "../../types";
import { verifyParam } from "..//helpers";
import { BatchMultiSigCall } from "../batchMultiSigCall";

const isInteger = (value: string, key: string) => {
  if (value.length === 0) {
    throw new Error(`${key} cannot be empty string`);
  }
  if (value.startsWith("-")) {
    throw new Error(`${key} cannot be negative`);
  }
  if (value.includes(".")) {
    throw new Error(`${key} cannot be a decimal`);
  }
};

const isAddress = (value: string, key: string) => {
  if (value.length === 0) {
    throw new Error(`${key} address cannot be empty string`);
  }
  if (!utils.isAddress(value)) {
    throw new Error(`${key} address is not a valid address`);
  }
};

export function verifyCall(this: BatchMultiSigCall, call: IMSCallInput) {
  // To address validator
  if (!call.to) {
    throw new Error("To address is required");
  } else if (typeof call.to === "string") {
    isAddress(call.to, "To");
  }

  // // From address validator
  // if (!call.from) {
  //   throw new Error("From address is required");
  // } else if (typeof call.from === "string") {
  //   isAddress(call.from, "From");
  // }

  // Value validator
  if (call.value && typeof call.value === "string") {
    isInteger(call.value, "Value");
  }

  // Method validator
  if (call.method && call.method.length === 0) {
    throw new Error("Method cannot be empty string");
  }

  // Node ID validator
  if (call.nodeId) {
    const index = this.calls.findIndex((item) => item.nodeId === call.nodeId);

    if (index > -1) {
      throw new Error(`Node ID ${call.nodeId} already exists, please use a different one`);
    }
  }

  // Options validator
  if (call.options) {
    const { gasLimit, callType } = call.options;
    if (gasLimit && typeof gasLimit === "string") {
      isInteger(gasLimit, "Gas limit");
    }
    if (callType) {
      const keysOfCALLTYPE = Object.keys(CALL_TYPE);
      if (!keysOfCALLTYPE.includes(callType)) {
        throw new Error(`Call type ${callType} is not valid`);
      }
    }
  }

  if (call.params && call.params.length) {
    if (!call.method) {
      throw new Error("Method is required when params are present");
    }
    call.params.map(verifyParam);
  }
}
