import { AllPlugins } from "@kirobo/ki-eth-fct-provider-ts";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { FCTCall, IBatchMultiSigCallFCT, IMSCallInput, IMSCallInputWithNodeId } from "../types";
export declare function create(this: BatchMultiSigCall, call: FCTCall): Promise<IMSCallInputWithNodeId>;
export declare function createMultiple(this: BatchMultiSigCall, calls: FCTCall[]): Promise<IMSCallInputWithNodeId[]>;
export declare function createPlugin(this: BatchMultiSigCall, Plugin: AllPlugins): import("@kirobo/ki-eth-fct-provider-ts").NewPluginType<"UNISWAP", "ACTION", "addLiquidityETH", string, {
    input: {
        to: import("@kirobo/ki-eth-fct-provider-ts").FctAddress;
        value: import("@kirobo/ki-eth-fct-provider-ts").FctValue;
        methodParams: {
            token: import("@kirobo/ki-eth-fct-provider-ts").FctAddress;
            amountTokenDesired: import("@kirobo/ki-eth-fct-provider-ts").FctValue;
            amountTokenMin: import("@kirobo/ki-eth-fct-provider-ts").FctValue;
            amountETHMin: import("@kirobo/ki-eth-fct-provider-ts").FctValue;
            to: import("@kirobo/ki-eth-fct-provider-ts").FctAddress;
            deadline: import("@kirobo/ki-eth-fct-provider-ts").FctValue;
        };
    };
    output: {
        amountA: import("@kirobo/ki-eth-fct-provider-ts").FctValue;
        amountB: import("@kirobo/ki-eth-fct-provider-ts").FctValue;
        liquidity: import("@kirobo/ki-eth-fct-provider-ts").FctValue;
    };
}, Partial<{
    to: string | ({
        type: "output";
        id: {
            nodeId: string;
            innerIndex: number;
        };
    } | {
        type: "external";
        id: number;
    } | {
        type: "global";
        id: "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
    } | {
        type: "computed";
        id: string;
    }) | undefined;
    value: string | ({
        type: "output";
        id: {
            nodeId: string;
            innerIndex: number;
        };
    } | {
        type: "external";
        id: number;
    } | {
        type: "global";
        id: "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
    } | {
        type: "computed";
        id: string;
    }) | undefined;
    methodParams: Partial<{
        token: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
        } | {
            type: "computed";
            id: string;
        }) | undefined;
        amountTokenDesired: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
        } | {
            type: "computed";
            id: string;
        }) | undefined;
        amountTokenMin: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
        } | {
            type: "computed";
            id: string;
        }) | undefined;
        amountETHMin: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
        } | {
            type: "computed";
            id: string;
        }) | undefined;
        to: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
        } | {
            type: "computed";
            id: string;
        }) | undefined;
        deadline: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
        } | {
            type: "computed";
            id: string;
        }) | undefined;
    }>;
}>>;
export declare function getCall(this: BatchMultiSigCall, index: number): IMSCallInput;
export declare function exportFCT(this: BatchMultiSigCall): IBatchMultiSigCallFCT;
export declare function importFCT(this: BatchMultiSigCall, fct: IBatchMultiSigCallFCT): IMSCallInput[];
export declare function importEncodedFCT(this: BatchMultiSigCall, calldata: string): Promise<import("../types").StrictMSCallInput[]>;
