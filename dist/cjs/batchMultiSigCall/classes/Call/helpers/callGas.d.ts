import { ChainId } from "@kiroboio/fct-plugins";
declare const gasCosts: {
    readonly call_firstOverhead: 35000n;
    readonly call_otherOverhead: 8400n;
    readonly delegateCall_firstOverhead: 44000n;
    readonly delegateCall_otherOverhead: 17200n;
    readonly delegateCall_repeatOverhead: 10800n;
    readonly nativeTokenOverhead: 6550n;
};
export declare const getGasCosts: (key: keyof typeof gasCosts, chainId: ChainId) => bigint;
export {};
//# sourceMappingURL=callGas.d.ts.map