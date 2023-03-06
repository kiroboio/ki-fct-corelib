import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { DecodedCalls, IBatchMultiSigCallFCT, MSCall } from "../../types";
import { FCTBase } from "../FCTBase";
import * as helpers from "./helpers";
export declare class ExportFCT extends FCTBase {
    calls: DecodedCalls[];
    private _eip712;
    constructor(FCT: BatchMultiSigCall);
    get typedData(): import("../../types").BatchMultiSigCallTypedData;
    get mcall(): MSCall[];
    get sessionId(): string;
    get(): IBatchMultiSigCallFCT;
    getCalls(): MSCall[];
    static helpers: typeof helpers;
}
