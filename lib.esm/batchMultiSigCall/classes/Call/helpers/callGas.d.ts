import { Variable } from "../../../../types";
import { Call } from "../Call";
import { ICall } from "../types";
declare const gasCosts: {
    readonly call_firstOverhead: 35000n;
    readonly call_otherOverhead: 8400n;
    readonly delegateCall_firstOverhead: 44000n;
    readonly delegateCall_otherOverhead: 17200n;
    readonly delegateCall_repeatOverhead: 10800n;
    readonly nativeTokenOverhead: 6550n;
};
export declare const getGasCosts: (key: keyof typeof gasCosts) => 35000n | 8400n | 44000n | 17200n | 10800n | 6550n;
export declare function getCallGasLimit({ payerIndex, value, callType, gasLimit, calls, }: {
    payerIndex: number;
    value: string | Variable;
    callType: ICall["options"]["callType"];
    gasLimit: string;
    calls: Call[];
}): string;
export {};
//# sourceMappingURL=callGas.d.ts.map