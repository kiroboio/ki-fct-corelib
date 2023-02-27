import { IMSCallInput, Param } from "types";
type EIP712TypesObject = Record<string, {
    name: string;
    type: string;
}[]>;
export declare class EIP712StructTypes {
    transactionTypes: EIP712TypesObject;
    structTypes: EIP712TypesObject;
    constructor(calls: IMSCallInput[]);
    getTypeCount: () => number;
    getStructType: (param: Param, index: number) => string;
}
export {};
