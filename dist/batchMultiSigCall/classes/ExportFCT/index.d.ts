import { DecodedCalls, IBatchMultiSigCallFCT } from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { MSCall } from "../../types/general";
import { FCTBase } from "../FCTBase";
import * as helpers from "./helpers";
export declare class ExportFCT extends FCTBase {
    calls: DecodedCalls[];
    private _eip712;
    constructor(FCT: BatchMultiSigCall);
    get typedData(): import("../../types/typedData").BatchMultiSigCallTypedData;
    get mcall(): MSCall[];
    get sessionId(): string;
    get(): IBatchMultiSigCallFCT;
    getCalls(): MSCall[];
    static helpers: typeof helpers;
}
