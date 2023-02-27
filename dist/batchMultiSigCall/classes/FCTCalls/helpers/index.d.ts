import { ethers, utils } from "ethers";
import { Param } from "types";
export declare const isInteger: (value: string, key: string) => void;
export declare const isAddress: (value: string, key: string) => void;
export declare const verifyParam: (param: Param) => void;
export declare const getParamsFromInputs: (inputs: ethers.utils.ParamType[], values: ethers.utils.Result) => Param[];
