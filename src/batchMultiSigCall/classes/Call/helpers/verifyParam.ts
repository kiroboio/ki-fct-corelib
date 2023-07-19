import { utils } from "ethers";

import { InstanceOf } from "../../../../helpers";
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
  if (InstanceOf.Variable(param.value)) return;
  if (!param.value) {
    throw new Error(`Param ${param.name} is missing a value`);
  }

  if (Array.isArray(param.value) && param.type.includes("[") && param.type.includes("]")) {
    if (param.type.indexOf("]") - param.type.indexOf("[") > 1) {
      const length = +param.type.slice(param.type.indexOf("[") + 1, param.type.indexOf("]"));
      if (param.value.length !== length) {
        throw new Error(`Param ${param.name} (${param.type}) value is not an array of length ${length}`);
      }
    }

    const type = param.type.slice(0, param.type.lastIndexOf("["));

    (param.value as Exclude<typeof param.value, Param[]>).forEach((value, index) => {
      verifyParam({
        name: `${param.name}[${index}]`,
        type,
        value: value,
      });
    });
  }

  // Check if type boolean is a boolean value
  if (param.type === "bool") {
    if (typeof param.value !== "boolean") {
      throw new Error(`Param ${param.name} is not a boolean`);
    }
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
    // Check if type has a length
    const length = param.type.match(/\d+/g);
    if (!length) {
      // If no length, then the type is `bytes`
      return;
    }

    const requiredLength = +length[0] * 2 + 2;
    if (param.value.length !== requiredLength) {
      throw new Error(`Param ${param.name} is not a valid ${param.type} value`);
    }
  }
};
