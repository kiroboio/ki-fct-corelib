import { IMSCallInput } from "../batchMultiSigCall/interfaces";
import { Validator } from "../interfaces";
export declare const getValidatorFunctionData: (validator: Validator, params: any[]) => {
    name: string;
    type: string;
}[];
export declare const getValidatorMethodInterface: (validator: Validator) => string;
export declare const getValidatorData: (call: Partial<IMSCallInput>, noFunctionSignature: boolean) => string;
export declare const createValidatorTxData: (call: Partial<IMSCallInput>) => object | Error;
