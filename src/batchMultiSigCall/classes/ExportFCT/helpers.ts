import { BatchMultiSigCallTypedData } from "../../types";

export const getUsedStructTypes = (typedData: BatchMultiSigCallTypedData, typeName: string): string[] => {
  const mainType = typedData.types[typeName.replace("[]", "")];

  return mainType.reduce((acc, item) => {
    if (item.type.includes("Struct")) {
      const type = item.type.replace("[]", "");
      return [...acc, type, ...getUsedStructTypes(typedData, type)];
    }
    return acc;
  }, [] as string[]);
};
