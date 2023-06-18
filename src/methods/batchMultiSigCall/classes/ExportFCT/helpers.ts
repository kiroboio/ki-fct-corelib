import { BatchMultiSigCallTypedData } from "../../types";

export const getUsedStructTypes = (typedData: BatchMultiSigCallTypedData, typeName: string) => {
  const mainType = typedData.types[typeName.replace("[]", "")];

  const usedStructTypes: string[] = mainType.reduce<string[]>((acc, item) => {
    if (item.type.includes("Struct") || (item.type.includes("FCTMulticall") && !item.type.includes("_data"))) {
      const type = item.type.replace("[]", "");
      return [...acc, type, ...getUsedStructTypes(typedData, type)];
    }
    return acc;
  }, []);
  return usedStructTypes;
};
