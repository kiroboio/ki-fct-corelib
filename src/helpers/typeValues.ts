import { TypedDataUtils } from "@metamask/eth-sig-util";
import { utils } from "ethers";

import { BatchMultiSigCallTypedData, Param } from "../types";

const TYPE_NATIVE = 1000;
const TYPE_STRING = 2000;
const TYPE_BYTES = 3000;
const TYPE_ARRAY = 4000;
const TYPE_ARRAY_WITH_LENGTH = 5000; // Example: uint256[2] - [TYPE_ARRAY_WITH_LENGTH, 2, ...rest]

const getFixedArrayLength = (type: string): number => +type.slice(type.indexOf("[") + 1, type.indexOf("]"));

const typeValue = (param: Param): number[] => {
  // If type is an array
  if (param.type.lastIndexOf("[") > 0 && !param.hashed) {
    const value = param.value as Param[][];
    const countOfElements = value[0].length;
    const TYPE = param.type.indexOf("]") - param.type.indexOf("[") === 1 ? TYPE_ARRAY : TYPE_ARRAY_WITH_LENGTH;

    // If the type is an array of tuple/custom struct
    if (param.customType || param.type.includes("tuple")) {
      const typesArray = getTypesArray(value[0]);
      if (TYPE === TYPE_ARRAY_WITH_LENGTH) {
        return [TYPE, getFixedArrayLength(param.type), countOfElements, ...typesArray];
      }
      return [TYPE, countOfElements, ...typesArray];
    }

    // Else it is an array with non-custom types
    const parameter = { ...param, type: param.type.slice(0, param.type.lastIndexOf("[")) };
    const insideType = typeValue(parameter);

    if (TYPE === TYPE_ARRAY_WITH_LENGTH) {
      return [TYPE, getFixedArrayLength(param.type), countOfElements, ...insideType];
    }

    return [TYPE, ...insideType];
  }

  // If type is a string
  if (param.type === "string" && !param.hashed) {
    return [TYPE_STRING];
  }

  // If type is bytes
  if (param.type === "bytes" && !param.hashed) {
    return [TYPE_BYTES];
  }

  // If param is custom struct
  if (param.customType || param.type.includes("tuple")) {
    const values = param.value as Param[];

    const types = values.reduce((acc, item) => {
      return [...acc, ...typeValue(item)];
    }, [] as number[]);

    return [values.length, ...types];
  }

  // If all statements above are false, then type is a native type
  return [TYPE_NATIVE];
};

// Get Types array
export const getTypesArray = (params: Param[]): number[] => {
  const types = params.reduce((acc, item) => {
    const data = typeValue(item);
    return [...acc, ...data];
  }, [] as number[]);

  if (!types.some((item) => item !== TYPE_NATIVE)) {
    return [];
  }
  return types;
};

export const getTypedHashes = (params: Param[], typedData: BatchMultiSigCallTypedData): string[] => {
  return params.reduce((acc, item) => {
    if (item.customType) {
      const type: string = item.type.lastIndexOf("[") > 0 ? item.type.slice(0, item.type.lastIndexOf("[")) : item.type;
      return [...acc, utils.hexlify(utils.hexlify(TypedDataUtils.hashType(type, typedData.types)))];
    }
    return acc;
  }, [] as string[]);
};
