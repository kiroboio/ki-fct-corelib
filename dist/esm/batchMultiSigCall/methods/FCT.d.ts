import { AllPlugins } from "@kiroboio/fct-plugins";
import { FCTInputCall } from "../../types";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import { Call } from "../classes";
import { FCTCall, IFCT } from "../types";
import { PluginParams } from "./types";
export declare function create(this: BatchMultiSigCall, call: FCTInputCall): Promise<Call>;
export declare function createMultiple(this: BatchMultiSigCall, calls: FCTInputCall[]): Promise<FCTCall[]>;
export declare function addAtIndex(this: BatchMultiSigCall, call: FCTInputCall, index: number): Promise<FCTCall>;
export declare function createPlugin<T extends AllPlugins>(this: BatchMultiSigCall, { plugin, initParams, }: {
    plugin: T;
    initParams?: PluginParams<T>;
}): import("@kiroboio/fct-plugins").NewPluginType<"VALIDATION_VARIABLE", "VALIDATION_VARIABLE", "validate", "validate", {
    input: {
        nodeId: import("@kiroboio/fct-plugins").FctString;
        methodParams: {
            id: import("@kiroboio/fct-plugins").FctString;
            value1: import("@kiroboio/fct-plugins").FctValue;
            operator: import("@kiroboio/fct-plugins").FctString;
            value2: import("@kiroboio/fct-plugins").FctValue;
        };
    };
    output: {
        result: import("@kiroboio/fct-plugins").FctValue;
    };
}, Partial<{
    nodeId: string | ({
        type: "output";
        id: {
            nodeId: string;
            innerIndex: number;
            index?: number | undefined;
        };
    } | {
        type: "external";
        id: number;
    } | {
        type: "global";
        id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
    } | {
        id: string;
        type: "computed";
        value1: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | any | {
            id: string;
            type: "validation";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
        });
        operator1: string;
        value2: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | any | {
            id: string;
            type: "validation";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
        });
        operator2: string;
        value3: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | any | {
            id: string;
            type: "validation";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
        });
        operator3: string;
        value4: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | any | {
            id: string;
            type: "validation";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
        });
        overflowProtection: boolean;
    } | {
        id: string;
        type: "validation";
        value1: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator1: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator2: string;
            value3: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator3: string;
            value4: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            overflowProtection: boolean;
        } | any);
        operator: string;
        value2: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator1: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator2: string;
            value3: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            operator3: string;
            value4: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | any);
            overflowProtection: boolean;
        } | any);
    }) | undefined;
    methodParams: Partial<{
        id: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator1: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator2: string;
            value3: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator3: string;
            value4: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            overflowProtection: boolean;
        } | {
            id: string;
            type: "validation";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | {
                id: string;
                type: "computed";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator1: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator2: string;
                value3: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator3: string;
                value4: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                overflowProtection: boolean;
            } | any);
            operator: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | {
                id: string;
                type: "computed";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator1: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator2: string;
                value3: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator3: string;
                value4: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                overflowProtection: boolean;
            } | any);
        }) | undefined;
        value1: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator1: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator2: string;
            value3: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator3: string;
            value4: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            overflowProtection: boolean;
        } | {
            id: string;
            type: "validation";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | {
                id: string;
                type: "computed";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator1: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator2: string;
                value3: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator3: string;
                value4: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                overflowProtection: boolean;
            } | any);
            operator: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | {
                id: string;
                type: "computed";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator1: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator2: string;
                value3: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator3: string;
                value4: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                overflowProtection: boolean;
            } | any);
        }) | undefined;
        operator: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator1: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator2: string;
            value3: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator3: string;
            value4: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            overflowProtection: boolean;
        } | {
            id: string;
            type: "validation";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | {
                id: string;
                type: "computed";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator1: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator2: string;
                value3: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator3: string;
                value4: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                overflowProtection: boolean;
            } | any);
            operator: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | {
                id: string;
                type: "computed";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator1: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator2: string;
                value3: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator3: string;
                value4: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                overflowProtection: boolean;
            } | any);
        }) | undefined;
        value2: string | ({
            type: "output";
            id: {
                nodeId: string;
                innerIndex: number;
                index?: number | undefined;
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator1: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator2: string;
            value3: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            operator3: string;
            value4: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
            });
            overflowProtection: boolean;
        } | {
            id: string;
            type: "validation";
            value1: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | {
                id: string;
                type: "computed";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator1: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator2: string;
                value3: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator3: string;
                value4: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                overflowProtection: boolean;
            } | any);
            operator: string;
            value2: string | ({
                type: "output";
                id: {
                    nodeId: string;
                    innerIndex: number;
                    index?: number | undefined;
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
            } | {
                id: string;
                type: "computed";
                value1: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator1: string;
                value2: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator2: string;
                value3: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                operator3: string;
                value4: string | ({
                    type: "output";
                    id: {
                        nodeId: string;
                        innerIndex: number;
                        index?: number | undefined;
                    };
                } | {
                    type: "external";
                    id: number;
                } | {
                    type: "global";
                    id: "gasPrice" | "chainId" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "flowHash";
                } | any | any);
                overflowProtection: boolean;
            } | any);
        }) | undefined;
    }>;
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
//# sourceMappingURL=FCT.d.ts.map