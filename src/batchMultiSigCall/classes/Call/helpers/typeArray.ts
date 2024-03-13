import { Param } from "../../../../types";

const TYPE_NATIVE = 1000;
const TYPE_STRING = 2000;
const TYPE_BYTES = 3000;
const TYPE_ARRAY = 4000;
const TYPE_ARRAY_WITH_LENGTH = 5000; // Example: uint256[2] - [TYPE_ARRAY_WITH_LENGTH, 2, ...rest]

const getFixedArrayLength = (type: string): number => +type.slice(type.indexOf("[") + 1, type.indexOf("]"));

const typeValue = (param: Param): number[] => {
  // If type is an array
  if (param.type.lastIndexOf("[") > 0) {
    const TYPE = param.type.indexOf("]") - param.type.indexOf("[") === 1 ? TYPE_ARRAY : TYPE_ARRAY_WITH_LENGTH;

    // If the type is an array of tuple/custom struct
    if (param.customType || param.type.includes("tuple")) {
      const value = param.value as Param[][];
      const typesArray = getTypesArray(value[0], false);
      if (TYPE === TYPE_ARRAY_WITH_LENGTH) {
        // Get countOfElements from type
        const countOfElements = +param.type.slice(param.type.indexOf("[") + 1, param.type.indexOf("]"));
        return [TYPE, getFixedArrayLength(param.type), countOfElements, ...typesArray];
      }
      const countOfElements = value[0].length;
      return [TYPE, countOfElements, ...typesArray];
    }

    // Else it is an array with non-custom types
    const parameter = { ...param, type: param.type.slice(0, param.type.lastIndexOf("[")) };
    const insideType = typeValue(parameter);

    if (TYPE === TYPE_ARRAY_WITH_LENGTH) {
      return [TYPE, getFixedArrayLength(param.type), ...insideType];
    }

    return [TYPE, ...insideType];
  }

  // If type is a string
  if (param.type === "string") {
    return [TYPE_STRING];
  }

  // If type is bytes
  if (param.type === "bytes") {
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

export const getTypesArray = (params: Param[], removeNative = true): number[] => {
  const types = params.reduce((acc, item) => {
    const data = typeValue(item);
    return [...acc, ...data];
  }, [] as number[]);

  if (removeNative && !types.some((item) => item !== TYPE_NATIVE)) {
    return [];
  }
  return types;
};
