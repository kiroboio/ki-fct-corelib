import { BatchMultiSigCallTypedData, IMSCallInput } from "../types";
export declare const getTxEIP712Types: (calls: IMSCallInput[]) => {
    txTypes: {};
    structTypes: {};
};
export declare const getUsedStructTypes: (typedData: BatchMultiSigCallTypedData, typeName: string) => string[];
