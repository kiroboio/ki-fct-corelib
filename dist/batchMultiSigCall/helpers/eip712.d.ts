import { BatchMultiSigCallTypedData, ComputedVariables, IMSCallInput } from "../types";
export declare const getTxEIP712Types: (calls: IMSCallInput[]) => {
    txTypes: {};
    structTypes: {};
};
export declare const getUsedStructTypes: (typedData: BatchMultiSigCallTypedData, typeName: string) => string[];
export declare const getComputedVariableMessage: (computedVariables: ComputedVariables[]) => {};
