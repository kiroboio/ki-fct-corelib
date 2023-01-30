import { BatchMultiSigCallTypedData, ComputedVariables, IComputedVariable, IMSCallInput } from "../types";
type EIP712Types = Record<string, {
    name: string;
    type: string;
}[]>;
export declare const getTxEIP712Types: (calls: IMSCallInput[]) => {
    txTypes: EIP712Types;
    structTypes: EIP712Types;
};
export declare const getUsedStructTypes: (typedData: BatchMultiSigCallTypedData, typeName: string) => string[];
export declare const getComputedVariableMessage: (computedVariables: ComputedVariables[]) => Record<`computed_${number}`, IComputedVariable>;
export {};
