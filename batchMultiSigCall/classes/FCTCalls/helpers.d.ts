import { ethers, utils } from "ethers";
import { ParamType } from "ethers/lib/utils";
import { FCTCallParam, Param, TypedDataTypes } from "../../../types";
export declare const isInteger: (value: string, key: string) => void;
export declare const isAddress: (value: string, key: string) => void;
export declare const verifyParam: (param: Param) => void;
export declare const getParamsFromInputs: (inputs: ethers.utils.ParamType[], values: ethers.utils.Result) => Param[];
export declare const getParamsFromTypedData: ({ methodInterfaceParams, parameters, types, primaryType, }: {
    methodInterfaceParams: ethers.utils.ParamType[];
    parameters: Record<string, FCTCallParam>;
    types: TypedDataTypes;
    primaryType: string;
}) => Param[];
