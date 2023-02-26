import { Param } from "../../types";
import { BatchMultiSigCallTypedData, ComputedVariable, IComputedVariable, IMSCallInput } from "../types";

type EIP712Types = Record<string, { name: string; type: string }[]>;

// Create a function that checks if the param type last index of [ is greater than 0. If true - value is Param[][] else - value is Param[]
const isInstanceOfTupleArray = (value: Param["value"], param: Param): value is Param[][] => {
  return (param.customType ?? false) && param.type.lastIndexOf("[") > 0;
};

const isInstanceOfTuple = (value: Param["value"], param: Param): value is Param[] => {
  return (param.customType ?? false) && param.type.lastIndexOf("[") === -1;
};

export const getTxEIP712Types = (calls: IMSCallInput[]) => {
  const txTypes: EIP712Types = {};
  const structTypes: EIP712Types = {};

  const getTypeCount = () => Object.values(structTypes).length + 1;

  const getStructType = (param: Param, index: number) => {
    const typeName = `Struct${getTypeCount()}`;

    let paramValue: Param[] | Param[][];

    if (isInstanceOfTupleArray(param.value, param)) {
      paramValue = param.value[0];
    } else if (isInstanceOfTuple(param.value, param)) {
      paramValue = param.value;
    } else {
      throw new Error(`Invalid param value: ${param.value} for param: ${param.name}`);
    }

    let customCount = 0;
    const eip712Type = paramValue.map((item) => {
      if (item.customType || item.type.includes("tuple")) {
        ++customCount;
        const innerTypeName = `Struct${getTypeCount() + customCount}`;
        return {
          name: item.name,
          type: innerTypeName,
        };
      }
      return {
        name: item.name,
        type: item.type,
      };
    });

    structTypes[typeName] = eip712Type;

    if (param.type.lastIndexOf("[") > 0) {
      for (const parameter of (param.value as Param[][])[0]) {
        if (parameter.customType || parameter.type.includes("tuple")) {
          getStructType(parameter, index);
        }
      }
    } else {
      for (const parameter of param.value as Param[]) {
        if (parameter.customType || parameter.type.includes("tuple")) {
          getStructType(parameter, index);
        }
      }
    }

    return typeName;
  };

  calls.forEach((call: IMSCallInput, index: number) => {
    const values = call.params
      ? call.params.map((param: Param) => {
          if (param.customType || param.type === "tuple") {
            const type = getStructType(param, index);
            return { name: param.name, type: param.type.lastIndexOf("[") > 0 ? `${type}[]` : type };
          }
          return {
            name: param.name,
            type: param.type,
          };
        })
      : [];

    txTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
  });

  return {
    txTypes,
    structTypes,
  };
};

export const getUsedStructTypes = (typedData: BatchMultiSigCallTypedData, typeName: string) => {
  const mainType = typedData.types[typeName.replace("[]", "")];

  const usedStructTypes: string[] = mainType.reduce<string[]>((acc, item) => {
    if (item.type.includes("Struct")) {
      const type = item.type.replace("[]", "");
      return [...acc, type, ...getUsedStructTypes(typedData, type)];
    }
    return acc;
  }, []);
  return usedStructTypes;
};

export const getComputedVariableMessage = (
  computedVariables: ComputedVariable[]
): Record<`computed_${number}`, IComputedVariable> => {
  return computedVariables.reduce((acc, item, i) => {
    return {
      ...acc,
      [`computed_${i + 1}`]: {
        index: (i + 1).toString(),
        var: item.value,
        add: item.add,
        sub: item.sub,
        mul: item.mul,
        div: item.div,
      },
    };
  }, {} as Record<`computed_${number}`, IComputedVariable>);
};
