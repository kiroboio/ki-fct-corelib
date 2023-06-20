import { BigNumber, ethers, utils } from "ethers";

import { FCTCallParam, Param, TypedDataTypes, Variable } from "../../../types";

const ParamType = ethers.utils.ParamType;

const TYPE_NATIVE = 1000;
const TYPE_STRING = 2000;
const TYPE_BYTES = 3000;
const TYPE_ARRAY = 4000;
const TYPE_ARRAY_WITH_LENGTH = 5000; // Example: uint256[2] - [TYPE_ARRAY_WITH_LENGTH, 2, ...rest]

export function generateNodeId(): string {
  return [...Array(20)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");
}

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

export const getParams = (params: Param[]): Record<string, FCTCallParam> => {
  return {
    ...params.reduce((acc, param) => {
      let value: FCTCallParam;

      if (param.customType || param.type.includes("tuple")) {
        if (param.type.lastIndexOf("[") > 0) {
          const valueArray = param.value as Param[][];
          value = valueArray.map((item) => getParams(item));
        } else {
          const valueArray = param.value as Param[];
          value = getParams(valueArray);
        }
      } else {
        value = param.value as string[] | string | boolean;
      }
      return {
        ...acc,
        [param.name]: value,
      };
    }, {}),
  };
};

const manageValue = (value: string | number | boolean | Variable) => {
  const variables = ["0xfb0", "0xfa0", "0xfc00000", "0xfd00000", "0xfdb000"];

  if (BigNumber.isBigNumber(value)) {
    const hexString = value.toHexString().toLowerCase();
    if (variables.some((v) => hexString.startsWith(v))) {
      value = hexString;
    }
    return value.toString();
  }

  if (typeof value === "number") {
    return value.toString();
  }

  return value;
};

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

export const getParamsFromInputs = (inputs: ethers.utils.ParamType[], values: ethers.utils.Result): Param[] => {
  return inputs.map((input, i) => {
    if (input.type === "tuple") {
      return {
        name: input.name,
        type: input.type,
        customType: true,
        value: getParamsFromInputs(input.components, values[i]),
      };
    }
    if (input.type === "tuple[]") {
      return {
        name: input.name,
        type: input.type,
        customType: true,
        value: values[i].map((tuple: ethers.utils.Result) => getParamsFromInputs(input.components, tuple)),
      };
    }
    let value = values[i];
    // Check if value isn't a variable
    value = manageValue(value);

    return {
      name: input.name,
      type: input.type,
      value,
    };
  });
};

export const getParamsFromTypedData = ({
  methodInterfaceParams,
  parameters,
  types,
  primaryType,
}: {
  methodInterfaceParams: ethers.utils.ParamType[];
  parameters: Record<string, FCTCallParam>;
  types: TypedDataTypes;
  primaryType: string;
}) => {
  const generateRealInputParams = (types: TypedDataTypes, primaryType: string) => {
    let type = types[primaryType];
    // If the type[0] name is call and type is Call, then slice the first element
    if (type[0].name === "call" && type[0].type === "Call") {
      type = type.slice(1);
    }
    const params: ethers.utils.ParamType[] = [];
    for (const { name, type: paramType } of type) {
      // Remove [] from the end of the type
      const typeWithoutArray = paramType.replace(/\[\]$/, "");

      if (types[typeWithoutArray]) {
        const components = generateRealInputParams(types, typeWithoutArray);
        params.push(ParamType.from({ name, type: typeWithoutArray, components }));
      } else {
        params.push(ParamType.from({ name, type: paramType }));
      }
    }
    return params;
  };

  const getParams = (
    realInputParams: ethers.utils.ParamType[],
    eip712InputTypes: ethers.utils.ParamType[],
    parameters: Record<string, FCTCallParam>
  ) => {
    return eip712InputTypes.map((input, i): Param => {
      const realInput = realInputParams[i];
      if (input.type === "tuple") {
        return {
          name: realInput.name,
          type: input.type,
          customType: true,
          value: getParams(
            realInput.components,
            input.components,
            parameters[realInput.name] as Record<string, FCTCallParam>
          ),
        };
      }
      if (input.type === "tuple[]") {
        return {
          name: realInput.name,
          type: input.type,
          customType: true,
          value: (parameters[realInput.name] as Record<string, FCTCallParam>[]).map((tuple) =>
            getParams(realInput.components, input.components, tuple)
          ),
        };
      }
      let value = parameters[realInput.name] as boolean | string | Variable | number;
      // Check if value isn't a variable
      value = manageValue(value);
      return {
        name: realInput.name,
        type: realInput.type,
        customType: false,
        // If realInputType.type is a string and eip712InputType.type is bytes32, value is hashed
        hashed: input.type === "bytes32" && realInput.type === "string",
        value,
      };
    });
  };

  const realInputParams = generateRealInputParams(types, primaryType);

  return getParams(realInputParams, methodInterfaceParams, parameters);
};
