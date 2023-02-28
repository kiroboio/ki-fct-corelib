import { BatchMultiSigCallTypedData, DecodedCalls, IBatchMultiSigCallFCT, TypedDataMessage, TypedDataTypes } from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { MSCall } from "../../types/general";
import * as helpers from "./helpers";
export declare class ExportFCT {
    FCT: BatchMultiSigCall;
    salt: string;
    calls: DecodedCalls[];
    version: string;
    sessionId: string;
    typedData: BatchMultiSigCallTypedData;
    mcall: MSCall[];
    static helpers: typeof helpers;
    constructor(FCT: BatchMultiSigCall);
    get(): IBatchMultiSigCallFCT;
    getCalls(): MSCall[];
    getTypedData(): BatchMultiSigCallTypedData;
    getTypedDataMessage(): TypedDataMessage;
    getTypedDataTypes(): TypedDataTypes;
    getTypedDataDomain(): import("../../types/typedData").TypedDataDomain;
    getPrimaryType(): string;
    private getPrimaryTypeTypes;
    private getCallsPrimaryType;
    private getComputedPrimaryType;
    private getTransactionTypedDataMessage;
}
