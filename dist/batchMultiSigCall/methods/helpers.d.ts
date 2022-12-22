import { Param } from "@types";
import { BatchMultiSigCall } from "../index";
import { BatchMultiSigCallTypedData, IFCTOptions, IMSCallInput, IRequiredApproval } from "../types";
export declare function getCalldataForActuator(this: BatchMultiSigCall, { signedFCT, purgedFCT, investor, activator, version, }: {
    signedFCT: object;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
}): string;
export declare function getAllRequiredApprovals(this: BatchMultiSigCall): Promise<IRequiredApproval[]>;
export declare function setOptions(this: BatchMultiSigCall, options: Partial<IFCTOptions>): IFCTOptions;
export declare function createTypedData(this: BatchMultiSigCall, salt: string, version: string): Promise<BatchMultiSigCallTypedData>;
export declare function getParamsFromCall(this: BatchMultiSigCall, call: IMSCallInput): {};
export declare function verifyParams(this: BatchMultiSigCall, params: Param[]): void;
export declare function handleTo(this: BatchMultiSigCall, call: IMSCallInput): string;
export declare function handleValue(this: BatchMultiSigCall, call: IMSCallInput): string;
