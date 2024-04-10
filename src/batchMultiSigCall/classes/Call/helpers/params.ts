import { BigNumber, ethers } from "ethers";

import { FCTCallParam, Param, ParamValue, TypedDataTypes, Variable } from "../../../../types";

const ParamType = ethers.utils.ParamType;
export const variableStarts = ["0xfb000000", "0xfa00000", "0xfc00000", "0xfd00000", "0xfdb000", "0xfe000"];

export const manageValue = (value: string | number | boolean | Variable) => {
  if (BigNumber.isBigNumber(value)) {
    const hexString = value.toHexString().toLowerCase();
    if (variableStarts.some((v) => hexString.startsWith(v))) {
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
  coreParamTypes,
  parameters,
  types,
  primaryType,
}: {
  coreParamTypes: ethers.utils.ParamType[];
  parameters: Record<string, FCTCallParam>;
  types: TypedDataTypes;
  primaryType: string;
}) => {
  const generateTypedDataTypes = (types: TypedDataTypes, primaryType: string) => {
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
        const components = generateTypedDataTypes(types, typeWithoutArray);
        params.push(ParamType.from({ name, type: typeWithoutArray, components }));
      } else {
        params.push(ParamType.from({ name, type: paramType }));
      }
    }
    return params;
  };

  const getParams = (
    typedDataTypes: ethers.utils.ParamType[],
    coreParamTypes: ethers.utils.ParamType[],
    parameters: Record<string, FCTCallParam>,
  ) => {
    return typedDataTypes.map((typedDataInput, i): Param => {
      const coreInput = coreParamTypes[i];
      if (coreInput.baseType === "tuple") {
        return {
          name: typedDataInput.name,
          type: "tuple",
          customType: true,
          value: getParams(
            typedDataInput.components,
            coreInput.components,
            parameters[typedDataInput.name] as Record<string, FCTCallParam>,
          ),
        };
      }
      if (coreInput.type === "tuple[]") {
        return {
          name: typedDataInput.name,
          type: "tuple[]",
          customType: true,
          value: (parameters[typedDataInput.name] as Record<string, FCTCallParam>[]).map((tuple) =>
            getParams(typedDataInput.components, coreInput.components, tuple),
          ),
        };
      }
      let value = parameters[typedDataInput.name] as boolean | string | Variable | number;
      // Check if value isn't a variable
      value = manageValue(value);
      return {
        name: typedDataInput.name,
        type: coreInput.type,
        customType: false,
        messageType: typedDataInput.type,
        value,
      };
    });
  };

  return getParams(generateTypedDataTypes(types, primaryType), coreParamTypes, parameters);
};

export const getAllSimpleParams = (params: Param[]): ParamValue[] => {
  return params.reduce((acc, param) => {
    if (param.customType) {
      if (param.type.lastIndexOf("[") > 0) {
        const valueArray = param.value as Param[][];
        const data = valueArray.map((item) => getAllSimpleParams(item)).flat();
        return [...acc, ...data];
      } else {
        const valueArray = param.value as Param[];
        return [...acc, ...getAllSimpleParams(valueArray)];
      }
    } else {
      // If it is an array of normal types,
      // then return the value as an array
      if (param.type.lastIndexOf("[") > 0) {
        const valueArray = param.value as ParamValue[];
        return [...acc, ...valueArray];
      }
      return [...acc, param.value as ParamValue];
    }
  }, [] as ParamValue[]);
};
