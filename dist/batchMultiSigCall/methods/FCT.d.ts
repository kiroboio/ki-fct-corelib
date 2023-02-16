import { RequiredKeys } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { FCTCall, IBatchMultiSigCallFCT, IMSCallInput } from "../types";
export declare function generateNodeId(): string;
export declare function create(this: BatchMultiSigCall, callInput: FCTCall): Promise<RequiredKeys<IMSCallInput, "nodeId">>;
export declare function createMultiple(this: BatchMultiSigCall, calls: FCTCall[]): Promise<IMSCallInput[]>;
export declare function getCall(this: BatchMultiSigCall, index: number): IMSCallInput;
export declare function exportFCT(this: BatchMultiSigCall): IBatchMultiSigCallFCT;
export declare function importFCT(this: BatchMultiSigCall, fct: IBatchMultiSigCallFCT): IMSCallInput[];
export declare function importEncodedFCT(this: BatchMultiSigCall, calldata: string): Promise<RequiredKeys<IMSCallInput, "nodeId">[]>;
export declare function setFromAddress(this: BatchMultiSigCall, address: string): void;
