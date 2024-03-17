import { Call } from "../Call";
import { IComputed } from "../Variables/types";
export declare const verifyMessageHash: (logs: any[], messageHashFromFCT: string) => boolean;
export declare const txTraceMapLog: (log: any) => {
    id: any;
    caller: any;
    callIndex: any;
    isSuccess: boolean;
};
export declare const executedCallsFromLogs: (logs: any[]) => {
    id: any;
    caller: any;
    callIndex: any;
    isSuccess: boolean;
}[];
export declare const manageValidationAndComputed: (acc: any, call: Call, computed: IComputed[]) => void;
//# sourceMappingURL=helpers.d.ts.map