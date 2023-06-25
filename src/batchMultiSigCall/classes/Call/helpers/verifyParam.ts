import { utils } from "ethers";

import { Param } from "../../../../types";

export const isInteger = (value: string, key: string) => {
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

export const isAddress = (value: string, key: string) => {
  if (value.length === 0) {
    throw new Error(`${key} address cannot be empty string`);
  }
  if (!utils.isAddress(value)) {
    throw new Error(`${key} address is not a valid address`);
  }
};

export const verifyParam = (param: Param) => {
  if (!param.value) {
    throw new Error(`Param ${param.name} is missing a value`);
  }
  if (typeof param.value !== "string") {
    return;
  }
  // uint value
  if (param.type.startsWith("uint")) {
    if (param.value.includes(".")) {
      throw new Error(`Param ${param.name} cannot be a decimal`);
    }
    if (param.value.startsWith("-")) {
      throw new Error(`Param ${param.name} cannot be negative`);
    }
  }
  // int value
  if (param.type.startsWith("int")) {
    if (param.value.includes(".")) {
      throw new Error(`Param ${param.name} cannot be a decimal`);
    }
  }
  // address
  if (param.type === "address") {
    if (!utils.isAddress(param.value)) {
      throw new Error(`Param ${param.name} is not a valid address`);
    }
  }
  // bytes
  if (param.type.startsWith("bytes")) {
    if (!param.value.startsWith("0x")) {
      throw new Error(`Param ${param.name} is not a valid bytes value`);
    }
  }
};
