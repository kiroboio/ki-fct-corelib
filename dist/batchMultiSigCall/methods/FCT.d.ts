import { BatchMultiSigCall } from "../batchMultiSigCall";
import { IBatchMultiSigCallFCT, IMSCallInput, IWithPlugin } from "../types";
export declare function create(this: BatchMultiSigCall, callInput: IMSCallInput | IWithPlugin): Promise<IMSCallInput[]>;
export declare function createMultiple(this: BatchMultiSigCall, calls: (IMSCallInput | IWithPlugin)[]): Promise<IMSCallInput[]>;
export declare function getCall(this: BatchMultiSigCall, index: number): IMSCallInput;
export declare function exportFCT(this: BatchMultiSigCall): IBatchMultiSigCallFCT;
export declare function importFCT(this: BatchMultiSigCall, fct: IBatchMultiSigCallFCT): IMSCallInput[];
export declare function importEncodedFCT(this: BatchMultiSigCall, calldata: string): Promise<IMSCallInput[]>;
