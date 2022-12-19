import { IMSCallInput } from "../batchMultiSigCall/types";
import { IValidator } from "../types";
export declare const getValidatorFunctionData: (validator: IValidator, params: any[]) => {
    name: string;
    type: string;
}[];
export declare const getValidatorMethodInterface: (validator: IValidator) => string;
export declare const getValidatorData: (call: Partial<IMSCallInput>, noFunctionSignature: boolean) => string;
export declare const createValidatorTxData: (call: Partial<IMSCallInput>) => object | Error;
