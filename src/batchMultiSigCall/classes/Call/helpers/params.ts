import { BigNumber, ethers } from "ethers";

import { FCTCallParam, Param, TypedDataTypes, Variable } from "../../../../types";

const ParamType = ethers.utils.ParamType;

export const manageValue = (value: string | number | boolean | Variable) => {
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
    parameters: Record<string, FCTCallParam>,
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
            parameters[realInput.name] as Record<string, FCTCallParam>,
          ),
        };
      }
      if (input.type === "tuple[]") {
        return {
          name: realInput.name,
          type: input.type,
          customType: true,
          value: (parameters[realInput.name] as Record<string, FCTCallParam>[]).map((tuple) =>
            getParams(realInput.components, input.components, tuple),
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
