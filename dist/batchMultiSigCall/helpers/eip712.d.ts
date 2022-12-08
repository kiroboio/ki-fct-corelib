import { BatchMultiSigCallTypedData, IMSCallInput } from "../interfaces";
export declare const getTxEIP712Types: (calls: IMSCallInput[]) => {
    txTypes: {};
    structTypes: {};
};
export declare const getUsedStructTypes: (typedData: BatchMultiSigCallTypedData, typeName: string) => string[];
