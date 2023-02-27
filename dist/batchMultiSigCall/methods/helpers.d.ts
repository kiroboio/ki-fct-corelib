import { DeepPartial, Param, ParamWithoutVariable, Variable } from "../../types";
import { BatchMultiSigCall } from "../index";
import { IFCTOptions, IRequiredApproval } from "../types";
export declare function getCalldataForActuator(this: BatchMultiSigCall, { signedFCT, purgedFCT, investor, activator, version, }: {
    signedFCT: object;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
}): string;
export declare function getAllRequiredApprovals(this: BatchMultiSigCall): IRequiredApproval[];
export declare function setOptions(this: BatchMultiSigCall, options: DeepPartial<IFCTOptions>): IFCTOptions;
export declare function handleVariableValue(this: BatchMultiSigCall, value: undefined | Variable | string, type: string, returnIfUndefined?: string): string;
export declare function decodeParams(this: BatchMultiSigCall, params: Param[]): ParamWithoutVariable[];
