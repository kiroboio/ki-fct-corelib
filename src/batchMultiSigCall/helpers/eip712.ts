import { getValidatorFunctionData } from "../../helpers";
import { Param } from "../../types";
import { BatchMultiSigCallTypedData, ComputedVariables, IMSCallInput } from "../types";

export const getTxEIP712Types = (calls: IMSCallInput[]) => {
  const txTypes = {};
  const structTypes = {};
  const getTypeCount = () => Object.values(structTypes).length + 1;

  const getStructType = (param: Param, index: number) => {
    const typeName = `Struct${getTypeCount()}`;

    let paramValue: Param[];
    if (param.type.lastIndexOf("[") > 0) {
      paramValue = param.value[0] as Param[];
    } else {
      paramValue = param.value as Param[];
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
      for (const parameter of param.value[0] as Param[]) {
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
    if (call.validator) {
      txTypes[`transaction${index + 1}`] = [
        { name: "call", type: "Call" },
        ...getValidatorFunctionData(call.validator, call.params),
      ];
      return;
    }

    // If call consists of a single custom type, then do not create a struct type
    if (call.params.length === 1 && call.params[0].customType) {
      const params = call.params[0].value as Param[];
      const values = params.map((param) => {
        return {
          name: param.name,
          type: param.type,
        };
      });
      txTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
      return;
    }

    const values = call.params.map((param: Param) => {
      if (param.customType || param.type === "tuple") {
        const type = getStructType(param, index);
        return { name: param.name, type };
      }
      return {
        name: param.name,
        type: param.type,
      };
    });

    txTypes[`transaction${index + 1}`] = [{ name: "call", type: "Call" }, ...values];
  });

  return {
    txTypes,
    structTypes,
  };
};

export const getUsedStructTypes = (typedData: BatchMultiSigCallTypedData, typeName: string) => {
  const mainType = typedData.types[typeName];

  const usedStructTypes: string[] = mainType.reduce<string[]>((acc, item) => {
    if (item.type.includes("Struct")) {
      return [...acc, item.type, ...getUsedStructTypes(typedData, item.type)];
    }
    return acc;
  }, []);
  return usedStructTypes;
};

export const getComputedVariableMessage = (computedVariables: ComputedVariables[]) => {
  return computedVariables.reduce((acc, item, i) => {
    return {
      ...acc,
      [`computed_${i + 1}`]: {
        index: (i + 1).toString(),
        var: item.variable,
        add: item.add,
        sub: item.sub,
        mul: item.mul,
        div: item.div,
      },
    };
  }, {});
};
