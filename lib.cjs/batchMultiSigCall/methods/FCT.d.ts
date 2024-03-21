import { AllPlugins } from "@kiroboio/fct-plugins";
import { FCTInputCall } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { Call } from "../classes";
import { FCTCall, IFCT, MSCalls_Eff } from "../types";
import { PluginParams } from "./types";
export declare function create(this: BatchMultiSigCall, call: FCTInputCall): Promise<Call>;
export declare function createMultiple(this: BatchMultiSigCall, calls: FCTInputCall[]): Promise<FCTCall[]>;
export declare function addAtIndex(this: BatchMultiSigCall, call: FCTInputCall, index: number): Promise<FCTCall>;
export declare function createPlugin<T extends AllPlugins>(this: BatchMultiSigCall, { plugin, initParams, }: {
    plugin: T;
    initParams?: PluginParams<T>;
}): import("@kiroboio/fct-plugins").NewPluginType<"SUSHISWAP", "ACTION", "simpleSwap", "swap", {
    input: {
        to: import("@kiroboio/fct-plugins").FctAddress;
        methodParams: {
            addressIn: import("@kiroboio/fct-plugins").FctAddress;
            amountIn: import("@kiroboio/fct-plugins").FctValue;
            decimalsIn: import("@kiroboio/fct-plugins").FctDecimals;
            addressOut: import("@kiroboio/fct-plugins").FctAddress;
            amountOut: import("@kiroboio/fct-plugins").FctValue;
            decimalsOut: import("@kiroboio/fct-plugins").FctDecimals;
            path: import("@kiroboio/fct-plugins").FctAddressList;
            to: import("@kiroboio/fct-plugins").FctAddress;
            deadline: import("@kiroboio/fct-plugins").FctTimestamp;
        };
    };
    output: {
        amountIn: import("@kiroboio/fct-plugins").FctValue;
        amountOut: import("@kiroboio/fct-plugins").FctValue;
    };
}, Partial<{
    to: string | import("@kiroboio/fct-plugins/dist/lib.esm/Fct/plugins/corelibTypes").Variable | undefined;
    methodParams: unknown;
}>>;
export declare function getCall(this: BatchMultiSigCall, index: number): FCTCall;
export declare function getCallByNodeId(this: BatchMultiSigCall, nodeId: string): FCTCall;
export declare function getIndexByNodeId(this: BatchMultiSigCall, nodeId: string): number;
export declare function exportMap(this: BatchMultiSigCall): {
    calls: string[];
    computed: string[];
    validations: string[];
};
/**
 * Prepares FCT data to be signed on and executed on the blockchain.
 * @returns The IFCT object representing the current state of the FCT.
 * @throws Error if no calls are added to FCT.
 */
export declare function exportFCT(this: BatchMultiSigCall): IFCT;
export declare function exportWithApprovals(this: BatchMultiSigCall): Promise<IFCT>;
export declare function exportWithPayment(this: BatchMultiSigCall, payer: string): Promise<IFCT>;
export declare function exportNotificationFCT(this: BatchMultiSigCall): IFCT;
export declare function importFCT<FCT extends IFCT>(this: BatchMultiSigCall, fct: FCT): Call[];
export declare function importFCTWithMap<FCT extends IFCT>(this: BatchMultiSigCall, fct: FCT, map: ReturnType<BatchMultiSigCall["exportMap"]>): Call[];
export declare function impFCT(this: BatchMultiSigCall, fct: IFCT, map?: ReturnType<BatchMultiSigCall["exportMap"]>): Call[];
export declare function exportEfficientFCT(this: BatchMultiSigCall): MSCalls_Eff;
//# sourceMappingURL=FCT.d.ts.map