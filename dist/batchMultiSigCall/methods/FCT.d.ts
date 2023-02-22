import { AllPlugins } from "@kirobo/ki-eth-fct-provider-ts";
import { DeepPartial } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { FCTCall, IBatchMultiSigCallFCT, ICallDefaults, IMSCallInput, IMSCallInputWithNodeId, IMSCallWithEncodedData, IWithPlugin } from "../types";
export declare function generateNodeId(): string;
export declare function create(this: BatchMultiSigCall, callInput: FCTCall): Promise<IMSCallInputWithNodeId>;
export declare function createMultiple(this: BatchMultiSigCall, calls: FCTCall[]): Promise<IMSCallInputWithNodeId[]>;
export declare function createWithPlugin(this: BatchMultiSigCall, callWithPlugin: IWithPlugin): Promise<IMSCallInputWithNodeId>;
export declare function createWithEncodedData(this: BatchMultiSigCall, callWithEncodedData: IMSCallWithEncodedData): Promise<IMSCallInputWithNodeId>;
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
        id: {
            variable: string | ({
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
            } | any);
            add?: string | undefined;
            sub?: string | undefined;
            mul?: string | undefined;
            div?: string | undefined;
        };
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
        id: {
            variable: string | ({
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
            } | any);
            add?: string | undefined;
            sub?: string | undefined;
            mul?: string | undefined;
            div?: string | undefined;
        };
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
            id: {
                variable: string | ({
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
                } | any);
                add?: string | undefined;
                sub?: string | undefined;
                mul?: string | undefined;
                div?: string | undefined;
            };
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
            id: {
                variable: string | ({
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
                } | any);
                add?: string | undefined;
                sub?: string | undefined;
                mul?: string | undefined;
                div?: string | undefined;
            };
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
            id: {
                variable: string | ({
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
                } | any);
                add?: string | undefined;
                sub?: string | undefined;
                mul?: string | undefined;
                div?: string | undefined;
            };
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
            id: {
                variable: string | ({
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
                } | any);
                add?: string | undefined;
                sub?: string | undefined;
                mul?: string | undefined;
                div?: string | undefined;
            };
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
            id: {
                variable: string | ({
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
                } | any);
                add?: string | undefined;
                sub?: string | undefined;
                mul?: string | undefined;
                div?: string | undefined;
            };
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
            id: {
                variable: string | ({
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
                } | any);
                add?: string | undefined;
                sub?: string | undefined;
                mul?: string | undefined;
                div?: string | undefined;
            };
        }) | undefined;
    }>;
}>>;
export declare function getCall(this: BatchMultiSigCall, index: number): IMSCallInput;
export declare function exportFCT(this: BatchMultiSigCall): IBatchMultiSigCallFCT;
export declare function importFCT(this: BatchMultiSigCall, fct: IBatchMultiSigCallFCT): IMSCallInput[];
export declare function importEncodedFCT(this: BatchMultiSigCall, calldata: string): Promise<import("../types").StrictMSCallInput[]>;
export declare function setCallDefaults(this: BatchMultiSigCall, callDefault: DeepPartial<ICallDefaults>): ICallDefaults;
