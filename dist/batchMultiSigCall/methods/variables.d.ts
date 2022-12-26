import { Variable } from "@types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
export declare function getVariable(this: BatchMultiSigCall, variable: Variable, type: string): string;
export declare function getOutputVariable(this: BatchMultiSigCall, index: number, innerIndex: number, type: string): string;
export declare function getExternalVariable(this: BatchMultiSigCall, index: number, type: string): string;
export declare function getComputedVariable(this: BatchMultiSigCall, index: number, type: string): string;
