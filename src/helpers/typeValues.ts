import { MessageTypeProperty, TypedDataUtils, TypedMessage } from "@metamask/eth-sig-util";
import { utils } from "ethers";
import { Param } from "../interfaces";

const TYPE_NATIVE = 1000;
const TYPE_STRING = 2000;
const TYPE_BYTES = 3000;
const TYPE_ARRAY = 4000;
const TYPE_ARRAY_WITH_LENGTH = 5000;

const typeValue = (param: Param): number[] => {
  // If type is an array
  if (param.type.lastIndexOf("[") > 0) {
    if (param.customType || param.type.includes("tuple")) {
      const value = param.value as Param[][];
      return [TYPE_ARRAY, value.length, ...getTypesArray(param.value[0] as Param[])];
    }

    const parameter = { ...param, type: param.type.slice(0, param.type.lastIndexOf("[")) };
    const insideType = typeValue(parameter);

    const type = param.type.indexOf("]") - param.type.indexOf("[") === 1 ? TYPE_ARRAY : TYPE_ARRAY_WITH_LENGTH;

    return [type, ...insideType];
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

    return [
      values.length,
      ...values.reduce((acc, item) => {
        return [...acc, ...typeValue(item)];
      }, []),
    ];
  }

  // If all statements above are false, then type is a native type
  return [TYPE_NATIVE];
};

// Get Types array
export const getTypesArray = (params: Param[]): number[] => {
  const types = params.reduce((acc, item) => {
    const data = typeValue(item);
    return [...acc, ...data];
  }, []);

  return types.some((item) => item !== TYPE_NATIVE) ? types : [];
};

export const getTypedHashes = (
  params: Param[],
  typedData: TypedMessage<Record<"EIP712Domain" & string, MessageTypeProperty[]>>
): string[] => {
  return params.reduce((acc, item) => {
    if (item.customType) {
      const type: string = item.type.lastIndexOf("[") > 0 ? item.type.slice(0, item.type.lastIndexOf("[")) : item.type;
      return [...acc, utils.hexlify(utils.hexlify(TypedDataUtils.hashType(type, typedData.types)))];
    }
    return acc;
  }, []);
};