import { Fragment } from "ethers/lib/utils";
import { IComputed } from "../batchMultiSigCall/types";
import { CALL_TYPE, Flow } from "../constants/index";
import { GlobalVariable } from "../variables/index";
export type Variable = {
    type: "output";
    id: {
        nodeId: string;
        innerIndex: number;
    };
} | {
    type: "external";
    id: number;
} | {
    type: "global";
    id: GlobalVariable;
} | {
    type: "computed";
    id: IComputed;
};
export interface Param {
    name: string;
    type: string;
    value?: boolean | string | string[] | Param[] | Param[][] | Variable;
    customType?: boolean;
    hashed?: boolean;
}
export interface MethodParamsInterface {
    method: string;
    params: Param[];
    to?: string | Variable;
}
export type CallType = keyof typeof CALL_TYPE;
export interface CallOptions {
    gasLimit?: string;
    flow?: Flow;
    jumpOnSuccess?: string;
    jumpOnFail?: string;
    falseMeansFail?: boolean;
    callType?: CallType;
}
export interface IPluginCall {
    value?: string | Variable;
    to: string | Variable;
    method: string;
    params: Param[];
    options?: CallOptions;
}
export type ABI = ReadonlyArray<Fragment>;
