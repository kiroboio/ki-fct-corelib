import { Param } from "../../../types";
import { BatchMultiSigCallTypedData, FCTCallParam } from "../../types";

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
