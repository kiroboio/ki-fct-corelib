import { Call } from "../../Call";
import { IComputed } from "../../Variables/types";
import { ITxTrace } from "../types";
export declare function getCallsFromTrace(trace: any): any;
export declare function getTraceData({ calls, callsFromTenderlyTrace, executedCalls, computedVariables, }: {
    calls: Call[];
    callsFromTenderlyTrace: any[];
    executedCalls: {
        id: any;
        caller: any;
        callIndex: any;
        isSuccess: boolean;
    }[];
    computedVariables: IComputed[];
}): ITxTrace;
export declare const verifyMessageHash: (logs: any[], messageHas: string) => boolean;
export declare const verifyMessageHashRaw: (logs: any[], messageHashFromFCT: string) => boolean;
export declare const txTraceMapLog: (log: any) => {
    id: any;
    caller: any;
    callIndex: any;
    isSuccess: boolean;
};
export declare const executedCallsFromLogs: (logs: any[], messageHash: string) => {
    id: any;
    caller: any;
    callIndex: any;
    isSuccess: boolean;
}[];
export declare const executedCallsFromRawLogs: (rawLogs: any[], messageHash: string) => {
    id: any;
    caller: any;
    callIndex: any;
    isSuccess: boolean;
}[];
export declare const manageValidationAndComputed: (acc: any, call: Call, computed: IComputed[]) => void;
//# sourceMappingURL=transactionTrace.d.ts.map