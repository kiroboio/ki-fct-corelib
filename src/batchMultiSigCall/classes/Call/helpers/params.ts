import { BigNumber, ethers, utils } from "ethers";
import { defaultAbiCoder, toUtf8Bytes } from "ethers/lib/utils";

import { InstanceOf } from "../../../../helpers";
import { FCTCallParam, MethodParamsInterface, Param, TypedDataTypes, Variable } from "../../../../types";
import { GetValueType } from "../types";

const ParamType = ethers.utils.ParamType;

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

const buildInputsFromParams = (params: Param[]): { type: string; name: string }[] => {
  return params.map((param) => {
    if (InstanceOf.Param(param.value)) {
      return { type: "tuple", name: param.name, components: buildInputsFromParams(param.value) };
    } else if (InstanceOf.ParamArray(param.value)) {
      return { type: "tuple[]", name: param.name, components: buildInputsFromParams(param.value[0]) };
    }

    return { type: param.hashed ? "bytes32" : param.type, name: param.name };
  });
};

// From method and params create tuple
// This version creates a ABI and gets the interface from it in ethers and then encodes the function bytes4
export const getMethodInterface = (call: { method?: string; params?: Param[] }): string => {
  if (!call.method) return "";
  const ABI = [
    {
      name: call.method,
      type: "function",
      constant: false,
      payable: false,
      inputs: buildInputsFromParams(call.params || []),
      outputs: [],
    },
  ];

  return new utils.Interface(ABI).getFunction(call.method).format();
};

export const getEncodedMethodParams = (call: Partial<MethodParamsInterface>): string => {
  if (!call.method) return "0x";

  const getType = (param: Param): string => {
    if (param.customType || param.type.includes("tuple")) {
      let value: Param[];
      let isArray = false;
      if (param.type.lastIndexOf("[") > 0) {
        isArray = true;
        value = (param.value as Param[][])[0];
      } else {
        value = param.value as Param[];
      }
      return `(${value.map(getType).join(",")})${isArray ? "[]" : ""}`;
    }
    return param.hashed ? "bytes32" : param.type;
  };

  const getValues = (param: Param): GetValueType => {
    if (!param.value) {
      throw new Error("Param value is required");
    }
    if (param.customType || param.type.includes("tuple")) {
      let value;
      if (param.type.lastIndexOf("[") > 0) {
        value = param.value as Param[][];
        return value.reduce((acc, val) => {
          return [...acc, val.map(getValues)];
        }, [] as GetValueType[][]);
      } else {
        value = param.value as Param[];
        return value.map(getValues);
      }
    }

    if (param.hashed) {
      if (typeof param.value === "string") {
        return utils.keccak256(toUtf8Bytes(param.value));
      }
      throw new Error("Hashed value must be a string");
    }

    return param.value as boolean | string;
  };
  if (!call.params) return "0x";

  return defaultAbiCoder.encode(call.params.map(getType), call.params.map(getValues));
};
