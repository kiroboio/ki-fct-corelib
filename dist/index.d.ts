import * as _kiroboio_fct_plugins from '@kiroboio/fct-plugins';
import { PluginInstance, AllPlugins, getPlugin as getPlugin$1, ChainId } from '@kiroboio/fct-plugins';
export * from '@kiroboio/fct-plugins';
export { utils as pluginUtils } from '@kiroboio/fct-plugins';
import { ethers } from 'ethers';
export { ethers } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { SignatureLike } from '@ethersproject/bytes';
import { MessageTypeProperty } from '@metamask/eth-sig-util';

declare enum Flow {
    OK_CONT_FAIL_REVERT = "OK_CONT_FAIL_REVERT",
    OK_CONT_FAIL_STOP = "OK_CONT_FAIL_STOP",
    OK_CONT_FAIL_CONT = "OK_CONT_FAIL_CONT",
    OK_REVERT_FAIL_CONT = "OK_REVERT_FAIL_CONT",
    OK_REVERT_FAIL_STOP = "OK_REVERT_FAIL_STOP",
    OK_STOP_FAIL_CONT = "OK_STOP_FAIL_CONT",
    OK_STOP_FAIL_REVERT = "OK_STOP_FAIL_REVERT",
    OK_STOP_FAIL_STOP = "OK_STOP_FAIL_STOP"
}

declare const multicallContracts: {
    1: string;
    5: string;
    42161: string;
    421613: string;
};
declare const nullValue = "0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
declare const FCBase = "0xFC00000000000000000000000000000000000000";
declare const FCBaseBytes = "0xFC00000000000000000000000000000000000000000000000000000000000000";
declare const FDBase = "0xFD00000000000000000000000000000000000000";
declare const FDBaseBytes = "0xFD00000000000000000000000000000000000000000000000000000000000000";
declare const FDBackBase = "0xFDB0000000000000000000000000000000000000";
declare const FDBackBaseBytes = "0xFDB0000000000000000000000000000000000000000000000000000000000000";
declare const ComputedBase = "0xFE00000000000000000000000000000000000000";
declare const ComputedBaseBytes = "0xFE00000000000000000000000000000000000000000000000000000000000000";
declare const ValidationBase = "0xE900000000000000000000000000000000000000000000000000000000000000";
declare const ValidationOperator: {
    readonly equal: string;
    readonly "not equal": string;
    readonly "greater than": string;
    readonly "greater equal than": string;
    readonly or: string;
    readonly "or not": string;
    readonly and: string;
    readonly "and not": string;
};
declare const CALL_TYPE: {
    readonly ACTION: "0";
    readonly VIEW_ONLY: "1";
    readonly LIBRARY: "2";
    readonly LIBRARY_VIEW_ONLY: "3";
};
declare const CALL_TYPE_MSG: {
    readonly ACTION: "action";
    readonly VIEW_ONLY: "view only";
    readonly LIBRARY: "library: action";
    readonly LIBRARY_VIEW_ONLY: "library: view only";
};
declare const CALL_TYPE_MSG_REV: {
    readonly action: "ACTION";
    readonly "view only": "VIEW_ONLY";
    readonly "library: action": "LIBRARY";
    readonly "library: view only": "LIBRARY_VIEW_ONLY";
};
declare const FCT_VAULT_ADDRESS: "FCT_VAULT_ADDRESS";

declare const index$2_CALL_TYPE: typeof CALL_TYPE;
declare const index$2_CALL_TYPE_MSG: typeof CALL_TYPE_MSG;
declare const index$2_CALL_TYPE_MSG_REV: typeof CALL_TYPE_MSG_REV;
declare const index$2_ComputedBase: typeof ComputedBase;
declare const index$2_ComputedBaseBytes: typeof ComputedBaseBytes;
declare const index$2_FCBase: typeof FCBase;
declare const index$2_FCBaseBytes: typeof FCBaseBytes;
declare const index$2_FCT_VAULT_ADDRESS: typeof FCT_VAULT_ADDRESS;
declare const index$2_FDBackBase: typeof FDBackBase;
declare const index$2_FDBackBaseBytes: typeof FDBackBaseBytes;
declare const index$2_FDBase: typeof FDBase;
declare const index$2_FDBaseBytes: typeof FDBaseBytes;
type index$2_Flow = Flow;
declare const index$2_Flow: typeof Flow;
declare const index$2_ValidationBase: typeof ValidationBase;
declare const index$2_ValidationOperator: typeof ValidationOperator;
declare const index$2_multicallContracts: typeof multicallContracts;
declare const index$2_nullValue: typeof nullValue;
declare namespace index$2 {
  export {
    index$2_CALL_TYPE as CALL_TYPE,
    index$2_CALL_TYPE_MSG as CALL_TYPE_MSG,
    index$2_CALL_TYPE_MSG_REV as CALL_TYPE_MSG_REV,
    index$2_ComputedBase as ComputedBase,
    index$2_ComputedBaseBytes as ComputedBaseBytes,
    index$2_FCBase as FCBase,
    index$2_FCBaseBytes as FCBaseBytes,
    index$2_FCT_VAULT_ADDRESS as FCT_VAULT_ADDRESS,
    index$2_FDBackBase as FDBackBase,
    index$2_FDBackBaseBytes as FDBackBaseBytes,
    index$2_FDBase as FDBase,
    index$2_FDBaseBytes as FDBaseBytes,
    index$2_Flow as Flow,
    index$2_ValidationBase as ValidationBase,
    index$2_ValidationOperator as ValidationOperator,
    index$2_multicallContracts as multicallContracts,
    index$2_nullValue as nullValue,
  };
}

type ValidationAddResult<V extends IValidation<true>> = V["id"] extends string ? {
    type: "validation";
    id: V["id"];
} : ValidationVariable;
interface ValidationVariable {
    type: "validation";
    id: string;
}
type IValidationValue<WithIValidation extends boolean> = WithIValidation extends true ? string | Variable | ValidationVariable | IValidation<WithIValidation> : string | Variable | ValidationVariable;
interface IValidation<WithIValidation extends boolean> {
    id?: string;
    value1: IValidationValue<WithIValidation>;
    operator: keyof typeof ValidationOperator;
    value2: IValidationValue<WithIValidation>;
}
interface IValidationData {
    value1: string;
    operator: string;
    value2: string;
}
interface IValidationEIP712 {
    index: string;
    value_1: string;
    op: keyof typeof ValidationOperator;
    value_2: string;
}

declare const ComputedOperators: {
    ADD: string;
    SUB: string;
    MUL: string;
    DIV: string;
    POW: string;
    MOD: string;
    LSHIFT: string;
    RSHIFT: string;
    AND: string;
    OR: string;
    XOR: string;
    MAX: string;
    MIN: string;
    ADD_ZEROS: string;
    SUB_ZEROS: string;
    HASH: string;
};

type IComputedOperator = (typeof ComputedOperators)[keyof typeof ComputedOperators];
type AddComputedResult<C extends Partial<IComputed>> = C["id"] extends string ? {
    type: "computed";
    id: C["id"];
} : {
    type: "computed";
    id: string;
};
interface IComputed {
    id?: string;
    value1: string | Variable;
    operator1: IComputedOperator;
    value2: string | Variable;
    operator2: IComputedOperator;
    value3: string | Variable;
    operator3: IComputedOperator;
    value4: string | Variable;
    overflowProtection: boolean;
}
interface IComputedEIP712 {
    index: string;
    value_1: string;
    op_1: string;
    value_2: string;
    op_2: string;
    value_3: string;
    op_3: string;
    value_4: string;
    overflow_protection: boolean;
}
interface IComputedData {
    overflowProtection: boolean;
    values: string[];
    operators: string[];
}

interface ICall {
    get options(): DeepRequired<CallOptions>;
    get nodeId(): string;
    get(): StrictMSCallInput;
    getDecoded(): DecodedCalls;
    getAsMCall(typedData: BatchMultiSigCallTypedData, index: number): MSCall;
    generateEIP712Type(index: number): {
        structTypes: {
            [key: string]: {
                name: string;
                type: string;
            }[];
        };
        callType: {
            name: string;
            type: string;
        }[];
    };
    generateEIP712Message(index: number): TypedDataMessageTransaction;
    getTypedHashes(index: number): string[];
    getEncodedData(): string;
    getTypesArray(): number[];
    getFunctionSignature(): string;
    getFunction(): string;
}

declare const MULTICALL_TYPES: {
    ACTION: string;
    VIEW_ONLY: string;
};
interface IMulticall {
    target: string;
    callType: keyof typeof MULTICALL_TYPES;
    method: string;
    params: Param[];
}
interface IFCTMulticallConstructor {
    from: string | Variable;
    options?: Omit<CallOptions, "callType">;
    nodeId?: string;
    FCT: BatchMultiSigCall;
}
interface IMulticallOutput {
    type: string;
}
declare class Multicall implements ICall {
    protected FCT: BatchMultiSigCall;
    private _calls;
    private _from;
    private _nodeId;
    private _options;
    private _to;
    private _outputTypes;
    constructor(input: IFCTMulticallConstructor);
    get nodeId(): string;
    get to(): string;
    get toENS(): string;
    get options(): DeepRequired<CallOptions>;
    get(): {
        to: string;
        toENS: string;
        from: string | Variable;
        params: Param[];
        method: string;
        value: string;
        options: {
            permissions: string;
            gasLimit: string;
            flow: Flow;
            jumpOnSuccess: string;
            jumpOnFail: string;
            falseMeansFail: boolean;
            callType: "ACTION" | "VIEW_ONLY" | "LIBRARY" | "LIBRARY_VIEW_ONLY";
            validation: string;
            payerIndex: number;
        };
        nodeId: string;
    };
    getDecoded(): {
        params: ParamWithoutVariable<Param>[];
        to: string;
        toENS: string;
        from: string | Variable;
        method: string;
        value: string;
        options: {
            permissions: string;
            gasLimit: string;
            flow: Flow;
            jumpOnSuccess: string;
            jumpOnFail: string;
            falseMeansFail: boolean;
            callType: "ACTION" | "VIEW_ONLY" | "LIBRARY" | "LIBRARY_VIEW_ONLY";
            validation: string;
            payerIndex: number;
        };
        nodeId: string;
    };
    get outputs(): Record<string, {
        type: "output";
        id: {
            nodeId: string;
            innerIndex: number;
        };
    } & {
        type: "output";
    }>;
    add: (call: IMulticall) => IMulticall[];
    addPlugin: (plugin: PluginInstance) => Promise<void>;
    setFrom: (from: string | Variable) => string | Variable;
    setOutputType: (outputType: IMulticallOutput) => IMulticallOutput;
    setOptions: (options: Omit<CallOptions, "callType">) => CallOptions;
    setNodeId: (nodeId: string) => string;
    get params(): Param[];
    getAsMCall: (typedData: BatchMultiSigCallTypedData, index: number) => {
        typeHash: string;
        ensHash: string;
        functionSignature: string;
        value: string;
        callId: string;
        from: string;
        to: string;
        data: string;
        types: number[];
        typedHashes: string[];
    };
    generateEIP712Message(index: number): TypedDataMessageTransaction;
    getFunction(): string;
    getFunctionSignature(): string;
    getEncodedData(): string;
    getTypesArray(): number[];
    getTypedHashes(): string[];
    generateEIP712Type(): {
        structTypes: {
            [key: string]: {
                name: string;
                type: string;
            }[];
        };
        callType: {
            name: string;
            type: string;
        }[];
    };
    private decodeParams;
    private getUsedStructTypes;
    private getStructType;
    private getParamsEIP712;
    private getJumps;
}

type PluginParams<T extends AllPlugins> = ConstructorParameters<T>[0]["initParams"];

type CreateOutput<F extends FCTInputCall> = F extends Multicall ? Multicall : Call;
declare function create<F extends FCTInputCall>(this: BatchMultiSigCall, call: F): Promise<CreateOutput<F>>;
declare function createMultiple(this: BatchMultiSigCall, calls: FCTInputCall[]): Promise<FCTCall[]>;
declare function addAtIndex(this: BatchMultiSigCall, call: FCTInputCall, index: number): Promise<FCTCall>;
declare function createPlugin<T extends AllPlugins>(this: BatchMultiSigCall, { plugin, initParams, }: {
    plugin: T;
    initParams?: PluginParams<T>;
}): _kiroboio_fct_plugins.NewPluginType<"VALIDATION_VARIABLE", "VALIDATION_VARIABLE", "validate", "validate", {
    input: {
        nodeId: _kiroboio_fct_plugins.FctString;
        methodParams: {
            id: _kiroboio_fct_plugins.FctString;
            value1: _kiroboio_fct_plugins.FctValue;
            operator: _kiroboio_fct_plugins.FctString;
            value2: _kiroboio_fct_plugins.FctValue;
        };
    };
    output: {
        result: _kiroboio_fct_plugins.FctBoolean;
    };
}, Partial<{
    nodeId: string | ({
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
        id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
    } | {
        id: string;
        type: "computed";
        value1: string | ({
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
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | any | {
            id: string;
            type: "validation";
            value1: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
            operator: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
        });
        operator1: string;
        value2: string | ({
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
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | any | {
            id: string;
            type: "validation";
            value1: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
            operator: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
        });
        operator2: string;
        value3: string | ({
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
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | any | {
            id: string;
            type: "validation";
            value1: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
            operator: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
        });
        operator3: string;
        value4: string | ({
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
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | any | {
            id: string;
            type: "validation";
            value1: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
            operator: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
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
            };
        } | {
            type: "external";
            id: number;
        } | {
            type: "global";
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | any | any);
        operator: string;
        value2: string | ({
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
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | any | any);
    }) | undefined;
    methodParams: Partial<{
        id: string | ({
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
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator1: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator2: string;
            value3: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator3: string;
            value4: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
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
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
            operator: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
        }) | undefined;
        value1: string | ({
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
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator1: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator2: string;
            value3: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator3: string;
            value4: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
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
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
            operator: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
        }) | undefined;
        operator: string | ({
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
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator1: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator2: string;
            value3: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator3: string;
            value4: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
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
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
            operator: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
        }) | undefined;
        value2: string | ({
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
            id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
        } | {
            id: string;
            type: "computed";
            value1: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator1: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator2: string;
            value3: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
            });
            operator3: string;
            value4: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | {
                id: string;
                type: "validation";
                value1: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
                } | any | any);
                operator: string;
                value2: string | ({
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
                    id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
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
                };
            } | {
                type: "external";
                id: number;
            } | {
                type: "global";
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
            operator: string;
            value2: string | ({
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
                id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
            } | any | any);
        }) | undefined;
    }>;
}>>;
declare function getCall(this: BatchMultiSigCall, index: number): FCTCall;
declare function getCallByNodeId(this: BatchMultiSigCall, nodeId: string): FCTCall;
declare function getIndexByNodeId(this: BatchMultiSigCall, nodeId: string): number;
declare function exportFCT(this: BatchMultiSigCall): IFCT;
declare function exportWithApprovals(this: BatchMultiSigCall): Promise<IFCT>;
declare function exportNotificationFCT(this: BatchMultiSigCall): IFCT;
declare function importFCT<FCT extends IFCT>(this: BatchMultiSigCall, fct: FCT): FCTCall[];

declare function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance>;
declare function getPluginClass(this: BatchMultiSigCall, index: number): Promise<ReturnType<typeof getPlugin$1>>;
declare function getPluginData(this: BatchMultiSigCall, index: number): Promise<{
    protocol: "SUSHISWAP" | "UNISWAP" | "COMPUTED_VARIABLE" | "VALIDATION_VARIABLE" | "ERC20" | "ERC721" | "ERC1155" | "TOKEN_MATH" | "TOKEN_VALIDATOR" | "UTILITY" | "PARASWAP" | "YEARN" | "COMPOUND_V2" | "COMPOUND_V3" | "1INCH" | "CURVE" | "CHAINLINK" | "UNISWAP_V3" | "SECURE_STORAGE" | "RADIANTV2" | "ROCKETPOOL" | "LIDO" | "AaveV3";
    type: "ACTION" | "LIBRARY" | "GETTER" | "VALIDATOR" | "CALCULATOR" | "ORACLE" | "COMPUTED_VARIABLE" | "VALIDATION_VARIABLE";
    method: "" | "symbol" | "equal" | "name" | "approve" | "totalSupply" | "decimals" | "balanceOf" | "allowance" | "supportsInterface" | "add" | "sub" | "div" | "mul" | "mod" | "getAmountsOut" | "borrow" | "getUserAccountData" | "deposit" | "simpleSwap" | "swap" | "addLiquidityETH" | "removeLiquidityETH" | "safeTransferFrom" | "setApprovalForAll" | "repay" | "swapBorrowRateMode" | "withdraw" | "supply" | "burn" | "getAmountsIn" | "isApprovedForAll" | "getReserveData" | "getUserReserveData" | "getReserveConfigurationData" | "getReserveTokensAddresses" | "getAssetPrice" | "lessThan" | "between" | "greaterThan" | "FLASHLOAN_PREMIUM_TOTAL" | "FLASHLOAN_PREMIUM_TO_PROTOCOL" | "add_liquidity" | "remove_liquidity" | "swapExactTokensForTokens" | "swapExactETHForTokens" | "swapExactTokensForETH" | "swapTokensForExactTokens" | "swapTokensForExactETH" | "swapETHForExactTokens" | "simpleRemoveLiquidity" | "exactInput" | "exactInputSingle" | "exactOutput" | "exactOutputSingle" | "mint" | "increaseLiquidity" | "decreaseLiquidity" | "collect" | "uniswapV3SwapTo" | "uniswapV3Swap" | "uniswapV3SwapToWithPermit" | "unoswap" | "buyOnUniswapV2Fork" | "megaSwap" | "multiSwap" | "simpleBuy" | "swapOnUniswapV2Fork" | "swapOnZeroXv4" | "safeBatchTransferFrom" | "swapTo_noSlippageProtection" | "swap_noSlippageProtection" | "addLiquidity_noMinProtection" | "addLiquidityTo_noMinProtection" | "liquidationCall" | "mintToTreasury" | "rebalanceStableBorrowRate" | "repayWithATokens" | "setUserEMode" | "setUserUseReserveAsCollateral" | "redeem" | "repayBorrow" | "enterMarkets" | "exitMarket" | "claimComp" | "supplyFrom" | "supplyTo" | "withdrawFrom" | "withdrawTo" | "exchange" | "exchange_with_best_rate" | "remove_liquidity_one_coin" | "create_lock" | "increase_amount" | "increase_unlock_time" | "write_bytes" | "write_bytes32" | "write_fct_bytes" | "write_fct_bytes32" | "write_fct_uint256" | "write_uint256" | "getReserves" | "positions" | "protocolFees" | "slot0" | "ticks" | "getApproved" | "ownerOf" | "tokenURI" | "uri" | "simulateSwap" | "getEModeCategoryData" | "getReserveNormalizedIncome" | "getReserveNormalizedVariableDebt" | "getUserEMode" | "latestRoundData" | "getAccountLiquidity" | "markets" | "borrowBalanceCurrent" | "collateralBalanceOf" | "isBorrowCollateralized" | "userBasic" | "borrowBalanceOf" | "getAssetInfoByAddress" | "getPrice" | "get_best_rate" | "get_exchange_amount" | "calc_token_amount" | "get_dy" | "locked" | "getSharesByPooledEth" | "getPooledEthByShares" | "sharesOf" | "getExchangeRate" | "getRethValue" | "getEthValue" | "getCollateralRate" | "read_bytes" | "read_bytes32" | "read_fct_bytes" | "read_fct_bytes32" | "read_fct_uint256" | "read_uint256" | "mulAndDiv" | "betweenEqual" | "equalAddress" | "equalBytes32" | "greaterEqual" | "lessEqual" | "getEthBalance" | "compute" | "validate" | ("transferFrom" | "transfer");
    input: {
        to: string | Variable;
        value: string | Variable;
        methodParams: {};
    };
}>;

declare function getCalldataForActuator({ signedFCT, purgedFCT, investor, activator, version, }: {
    signedFCT: IFCT;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
}): string;

declare const getAuthenticatorSignature: (typedData: BatchMultiSigCallTypedData) => ethers.Signature;

declare const utils_getAuthenticatorSignature: typeof getAuthenticatorSignature;
declare const utils_getCalldataForActuator: typeof getCalldataForActuator;
declare namespace utils {
  export {
    utils_getAuthenticatorSignature as getAuthenticatorSignature,
    utils_getCalldataForActuator as getCalldataForActuator,
  };
}

declare class BatchMultiSigCall {
    batchMultiSigSelector: string;
    version: string;
    chainId: ChainId;
    domain: TypedDataDomain;
    randomId: string;
    utils: FCTUtils;
    variables: Variables;
    validation: Validation;
    protected _options: Options;
    protected _calls: FCTCall[];
    protected _callDefault: ICallDefaults;
    constructor(input?: BatchMultiSigCallConstructor);
    get options(): RequiredFCTOptions;
    get calls(): FCTCall[];
    get callsAsObjects(): StrictMSCallInput[];
    get decodedCalls(): DecodedCalls[];
    get callDefault(): ICallDefaults;
    get computed(): IComputed[];
    get computedAsData(): IComputedData[];
    get validations(): Required<IValidation<false>>[];
    setOptions<O extends DeepPartial<IFCTOptions>>(options: O): {
        name: string;
        validFrom: string;
        expiresAt: string;
        maxGasPrice: string;
        blockable: boolean;
        purgeable: boolean;
        authEnabled: boolean;
        dryRun: boolean;
        verifier: string;
        domain: string;
        app: {
            name: string;
            version: string;
        };
        builder: {
            name: string;
            address: string;
        };
        recurrency: {
            maxRepeats: string;
            chillTime: string;
            accumetable: boolean;
        };
        multisig: {
            externalSigners: string[];
            minimumApprovals: string;
        };
    } & O;
    setCallDefaults<C extends DeepPartial<ICallDefaults>>(callDefault: C): Omit<RequiredKeys<Partial<MSCallBase>, "value">, "nodeId"> & {
        options: {
            validation: string;
            permissions: string;
            gasLimit: string;
            flow: Flow;
            jumpOnSuccess: string;
            jumpOnFail: string;
            falseMeansFail: boolean;
            callType: "ACTION" | "VIEW_ONLY" | "LIBRARY" | "LIBRARY_VIEW_ONLY";
        };
    } & C;
    changeChainId: (chainId: ChainId) => void;
    addComputed: <C extends Partial<IComputed>>(computed: C) => AddComputedResult<C>;
    addValidation: <V extends IValidation<true>>(validation: {
        nodeId: string;
        validation: V;
    }) => ValidationAddResult<V>;
    getPlugin: typeof getPlugin;
    getPluginClass: typeof getPluginClass;
    getPluginData: typeof getPluginData;
    createPlugin: typeof createPlugin;
    add: typeof create;
    addMultiple: typeof createMultiple;
    create: typeof create;
    createMultiple: typeof createMultiple;
    protected addAtIndex: typeof addAtIndex;
    export: typeof exportFCT;
    exportFCT: typeof exportFCT;
    exportNotification: typeof exportNotificationFCT;
    exportNotificationFCT: typeof exportNotificationFCT;
    exportWithApprovals: typeof exportWithApprovals;
    importFCT: typeof importFCT;
    getCall: typeof getCall;
    getCallByNodeId: typeof getCallByNodeId;
    getIndexByNodeId: typeof getIndexByNodeId;
    static utils: typeof utils;
    static from: (input: IFCT) => BatchMultiSigCall;
}

declare class CallBase {
    protected _call: IMSCallInput & {
        nodeId: string;
    };
    constructor(input: IMSCallInput);
    get call(): IMSCallInput & {
        nodeId: string;
    };
    get nodeId(): string;
    getOutputVariable(innerIndex?: number): Variable & {
        type: "output";
    };
    getTypesArray(): number[];
    getFunctionSignature(): string;
    getFunction(): string;
    setOptions(options: DeepPartial<CallOptions>): void;
    update(call: DeepPartial<IMSCallInput>): void;
}

declare class Call extends CallBase implements ICall {
    protected FCT: BatchMultiSigCall;
    constructor({ FCT, input }: {
        FCT: BatchMultiSigCall;
        input: IMSCallInput;
    });
    update(call: DeepPartial<IMSCallInput>): StrictMSCallInput;
    addValidation(validation: IValidation<true>): ValidationVariable;
    get options(): DeepRequired<CallOptions>;
    get(): StrictMSCallInput;
    getDecoded(): DecodedCalls;
    getAsMCall(typedData: BatchMultiSigCallTypedData, index: number): MSCall;
    generateEIP712Type(index: number): {
        structTypes: {
            [key: string]: {
                name: string;
                type: string;
            }[];
        };
        callType: {
            name: string;
            type: string;
        }[];
    };
    generateEIP712Message(index: number): TypedDataMessageTransaction;
    getTypedHashes(index: number): string[];
    getEncodedData(): string;
    private getUsedStructTypes;
    private getStructType;
    private getParamsEIP712;
    private getJumps;
    private decodeParams;
    private verifyCall;
    static create({ call, FCT }: {
        call: IMSCallInput | IWithPlugin;
        FCT: BatchMultiSigCall;
    }): Promise<Call>;
    private static createWithPlugin;
    private static createSimpleCall;
}

declare class FCTBase {
    protected FCT: BatchMultiSigCall;
    constructor(FCT: BatchMultiSigCall);
}

declare class Validation extends FCTBase {
    protected _validations: Required<IValidation<false>>[];
    constructor(FCT: BatchMultiSigCall);
    get(): Required<IValidation<false>>[];
    getForEIP712(): IValidationEIP712[];
    getForData(): IValidationData[];
    getIndex(id: string): number;
    add<V extends IValidation<true>>({ nodeId, validation, }: {
        nodeId: string;
        validation: V;
    }): ValidationAddResult<V>;
    addValidation(validation: IValidation<true>): string;
    private handleVariable;
    private isIValidation;
}

declare class FCTUtils extends FCTBase {
    private _eip712;
    constructor(FCT: BatchMultiSigCall);
    get FCTData(): IFCT;
    getAllRequiredApprovals(): Promise<IRequiredApproval[]>;
    getCalldataForActuator({ signatures, purgedFCT, investor, activator, }: {
        signatures: SignatureLike[];
        purgedFCT: string;
        investor: string;
        activator: string;
    }): string;
    getAuthenticatorSignature(): SignatureLike;
    recoverAddress(signature: SignatureLike): string | null;
    getMessageHash(): string;
    isValid(softValidation?: boolean): boolean | Error;
    getSigners(): string[];
    getAllPaths(): string[][];
    kiroPerPayerGas: ({ gas, gasPrice, penalty, ethPriceInKIRO, fees, }: {
        gas: string | bigint;
        gasPrice: string | bigint;
        penalty?: string | number | undefined;
        ethPriceInKIRO: string | bigint;
        fees?: {
            baseFeeBPS?: number | undefined;
            bonusFeeBPS?: number | undefined;
        } | undefined;
    }) => {
        ethCost: string;
        kiroCost: string;
    };
    getPaymentPerPayer: ({ signatures, gasPrice, maxGasPrice, ethPriceInKIRO, penalty, fees, }: {
        signatures?: SignatureLike[] | undefined;
        gasPrice?: string | number | bigint | undefined;
        maxGasPrice?: string | number | bigint | undefined;
        ethPriceInKIRO: string | bigint;
        penalty?: string | number | undefined;
        fees?: {
            baseFeeBPS?: string | number | undefined;
            bonusFeeBPS?: string | number | undefined;
        } | undefined;
    }) => {
        payer: string;
        largestPayment: {
            gas: string;
            amount: string;
            amountInETH: string;
        };
        smallestPayment: {
            gas: string;
            amount: string;
            amountInETH: string;
        };
    }[];
    getMaxGas: () => string;
    getCallResults: ({ rpcUrl, provider, txHash, }: {
        rpcUrl?: string | undefined;
        provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider | undefined;
        txHash: string;
    }) => Promise<{
        index: string;
        result: "SUCCESS" | "FAILED" | "SKIPPED";
    }[]>;
    private validateFCTKeys;
}

declare const mustBeInteger: string[];
declare const validateInteger: (value: string, keys: string[]) => void;
declare const validateAddress: (value: string, keys: string[]) => void;

declare const helpers_mustBeInteger: typeof mustBeInteger;
declare const helpers_validateAddress: typeof validateAddress;
declare const helpers_validateInteger: typeof validateInteger;
declare namespace helpers {
  export {
    helpers_mustBeInteger as mustBeInteger,
    helpers_validateAddress as validateAddress,
    helpers_validateInteger as validateInteger,
  };
}

declare class Options {
    static helpers: typeof helpers;
    private _options;
    set<O extends DeepPartial<IFCTOptions>>(options: O): IFCTOptions & O;
    get(): RequiredFCTOptions;
    reset(): void;
    static verify(options: IFCTOptions): void;
    static validateOptionsValues: (value: Partial<IFCTOptions> | IFCTOptions["recurrency"] | IFCTOptions["multisig"], parentKeys?: string[]) => void;
    static fromObject(options: DeepPartial<IFCTOptions>): Options;
}

declare class Variables extends FCTBase {
    protected _computed: Required<IComputed>[];
    constructor(FCT: BatchMultiSigCall);
    get computed(): Required<IComputed>[];
    get computedAsData(): IComputedData[];
    get computedForEIP712(): IComputedEIP712[];
    addComputed<C extends Partial<IComputed>>(computed: C): AddComputedResult<C>;
    getVariable(variable: Variable, type: string): string;
    private getOutputVariable;
    private getExternalVariable;
    private getComputedVariable;
    getValue(value: undefined | Variable | string, type: string, ifValueUndefined?: string): string;
    getVariablesAsBytes32: (variables: string[]) => string[];
    static getVariablesAsBytes32: (variables: string[]) => string[];
}

interface TypedDataRecurrency {
    max_repeats: string;
    chill_time: string;
    accumetable: boolean;
}
interface TypedDataMultiSig {
    signers: string[];
    required_signers: number;
}
type TypedDataTypes = {
    EIP712Domain: MessageTypeProperty[];
    BatchMultiSigCall: MessageTypeProperty[];
    Meta: MessageTypeProperty[];
    Limits: MessageTypeProperty[];
    Call: MessageTypeProperty[];
    Recurrency?: MessageTypeProperty[];
    MultiSig?: MessageTypeProperty[];
    Computed?: MessageTypeProperty[];
} & {
    [key: string]: MessageTypeProperty[];
};
interface TypedDataDomain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
}
type TypedDataMessageTransaction = {
    call: {
        call_index: number;
        payer_index: number;
        call_type: (typeof CALL_TYPE_MSG)[keyof typeof CALL_TYPE_MSG] | string;
        from: string;
        to: string;
        to_ens: string;
        value: string;
        gas_limit: string;
        permissions: number;
        validation: number;
        flow_control: string;
        returned_false_means_fail: boolean;
        jump_on_success: number;
        jump_on_fail: number;
        method_interface: string;
    };
} & {
    [key: string]: FCTCallParam;
};
interface TypedDataLimits {
    valid_from: string;
    expires_at: string;
    gas_price_limit: string;
    purgeable: boolean;
    blockable: boolean;
}
interface TypedDataMeta {
    name: string;
    app: string;
    app_version: string;
    builder: string;
    builder_address: string;
    domain: string;
}
interface TypedDataEngine {
    selector: string;
    version: string;
    random_id: string;
    eip712: boolean;
    verifier: string;
    auth_enabled: boolean;
    dry_run: boolean;
}
type MessageTransaction = Record<`transaction_${number}`, TypedDataMessageTransaction>;
type MessageMeta = Record<"meta", TypedDataMeta>;
type MessageEngine = Record<"engine", TypedDataEngine>;
type MessageLimits = Record<"limits", TypedDataLimits>;
type MessageRecurrency = Record<"recurrency", TypedDataRecurrency>;
type MessageMultiSig = Record<"multisig", TypedDataMultiSig>;
type MessageComputed = Record<`computed_${number}`, IComputedEIP712>;
type MessageValidation = Record<`validation_${number}`, IValidationEIP712>;
type MandatoryTypedDataMessage = MessageTransaction & MessageMeta & MessageEngine & MessageLimits;
type OptionalTypedDataMessage = MessageRecurrency & MessageMultiSig & MessageComputed;
type TypedDataMessage = MandatoryTypedDataMessage & Partial<OptionalTypedDataMessage>;
interface BatchMultiSigCallTypedData {
    types: TypedDataTypes;
    primaryType: string;
    domain: TypedDataDomain;
    message: TypedDataMessage;
}

type FCTCallParam = string | number | boolean | FCTCallParam[] | {
    [key: string]: FCTCallParam;
};
interface BatchMultiSigCallConstructor {
    chainId?: ChainId;
    options?: Partial<IFCTOptions>;
    defaults?: DeepPartial<ICallDefaults>;
    domain?: BatchMultiSigCallTypedData["domain"];
    version?: `0x${string}`;
}
interface IFCT {
    typedData: BatchMultiSigCallTypedData;
    typeHash: string;
    sessionId: string;
    nameHash: string;
    appHash: string;
    appVersionHash: string;
    builderHash: string;
    domainHash: string;
    verifierHash: string;
    builderAddress: string;
    mcall: MSCall[];
    signatures: SignatureLike[];
    variables: string[];
    externalSigners: string[];
    computed: IComputedData[];
    validations: IValidationData[];
}
interface MSCallBase {
    nodeId?: string;
    from?: string | Variable;
    value?: string | Variable;
    options?: CallOptions;
    addValidation?: IValidation<true>;
}
type IMSCallInput = {
    to: string | Variable;
    params?: Param[];
    method?: string;
    toENS?: string;
} & MSCallBase;
type FCTMCall = RequiredKeys<IMSCallInput, "nodeId">;
type StrictMSCallInput = RequiredKeys<IMSCallInput, "from" | "value" | "nodeId" | "options"> & {
    options: DeepRequired<CallOptions>;
};
interface DecodedCalls extends StrictMSCallInput {
    params?: ParamWithoutVariable<Param>[];
}
type IWithPlugin = {
    plugin: {
        create(): Promise<IPluginCall | undefined> | (IPluginCall | undefined);
    };
} & MSCallBase;
type IMSCallWithEncodedData = {
    nodeId?: string;
    abi: ReadonlyArray<ethers.utils.Fragment | JsonFragment> | string[];
    encodedData: string;
    to: string | Variable;
} & MSCallBase;
type FCTCall = Call | Multicall;
type FCTInputCall = IMSCallInput | IWithPlugin | FCTCall;
interface MSCall {
    typeHash: string;
    ensHash: string;
    functionSignature: string;
    value: string;
    callId: string;
    from: string;
    to: string;
    data: string;
    types: number[];
    typedHashes: string[];
}
interface IFCTOptions {
    name: string;
    validFrom: string;
    expiresAt: string;
    maxGasPrice: string;
    blockable: boolean;
    purgeable: boolean;
    authEnabled: boolean;
    dryRun: boolean;
    verifier: string;
    domain: string;
    app: {
        name: string;
        version: string;
    };
    builder: {
        name: string;
        address: string;
    };
    recurrency?: {
        maxRepeats: string;
        chillTime: string;
        accumetable: boolean;
    };
    multisig?: {
        externalSigners?: string[];
        minimumApprovals?: string;
    };
}
type RequiredFCTOptions = DeepRequired<IFCTOptions>;
type IRequiredApproval = ({
    protocol: "ERC20";
    method: "approve";
    params: {
        spender: string;
        amount: string;
    };
} | {
    protocol: "ERC721";
    method: "approve";
    params: {
        spender: string;
        tokenId: string;
    };
} | {
    protocol: "ERC1155" | "ERC721";
    method: "setApprovalForAll";
    params: {
        spender: string;
        approved: boolean;
        ids: string[];
    };
} | {
    protocol: "AAVE";
    method: "approveDelegation";
    params: {
        delegatee: string;
        amount: string;
    };
}) & {
    token: string;
    from: string;
};
type ICallDefaults = Omit<RequiredKeys<Partial<MSCallBase>, "value">, "nodeId"> & {
    options: DeepRequired<Omit<CallOptions, "payerIndex">>;
};

type GlobalVariable = "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress" | "chainId";
declare const globalVariables: {
    blockNumber: string;
    blockTimestamp: string;
    chainId: string;
    gasPrice: string;
    minerAddress: string;
    originAddress: string;
    investorAddress: string;
    activatorAddress: string;
    engineAddress: string;
};
declare const globalVariablesBytes: {
    blockNumber: string;
    blockTimestamp: string;
    chainId: string;
    gasPrice: string;
};
declare const getBlockNumber: () => Variable;
declare const getBlockTimestamp: () => Variable;
declare const getGasPrice: () => Variable;
declare const getMinerAddress: () => Variable;
declare const getOriginAddress: () => Variable;
declare const getInvestorAddress: () => Variable;
declare const getActivatorAddress: () => Variable;
declare const getEngineAddress: () => Variable;
declare const getChainID: () => Variable;

type index$1_GlobalVariable = GlobalVariable;
declare const index$1_getActivatorAddress: typeof getActivatorAddress;
declare const index$1_getBlockNumber: typeof getBlockNumber;
declare const index$1_getBlockTimestamp: typeof getBlockTimestamp;
declare const index$1_getChainID: typeof getChainID;
declare const index$1_getEngineAddress: typeof getEngineAddress;
declare const index$1_getGasPrice: typeof getGasPrice;
declare const index$1_getInvestorAddress: typeof getInvestorAddress;
declare const index$1_getMinerAddress: typeof getMinerAddress;
declare const index$1_getOriginAddress: typeof getOriginAddress;
declare const index$1_globalVariables: typeof globalVariables;
declare const index$1_globalVariablesBytes: typeof globalVariablesBytes;
declare namespace index$1 {
  export {
    index$1_GlobalVariable as GlobalVariable,
    index$1_getActivatorAddress as getActivatorAddress,
    index$1_getBlockNumber as getBlockNumber,
    index$1_getBlockTimestamp as getBlockTimestamp,
    index$1_getChainID as getChainID,
    index$1_getEngineAddress as getEngineAddress,
    index$1_getGasPrice as getGasPrice,
    index$1_getInvestorAddress as getInvestorAddress,
    index$1_getMinerAddress as getMinerAddress,
    index$1_getOriginAddress as getOriginAddress,
    index$1_globalVariables as globalVariables,
    index$1_globalVariablesBytes as globalVariablesBytes,
  };
}

type Variable = {
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
    id: GlobalVariable;
} | {
    type: "computed";
    id: string;
} | {
    type: "validation";
    id: string;
};
type ParamValue = boolean | string | string[] | boolean[] | Param[] | Param[][] | Variable | ParamValue[];
interface Param {
    name: string;
    type: string;
    value?: ParamValue;
    customType?: boolean;
    hashed?: boolean;
}
type ParamWithoutVariable<P extends Param> = P & {
    value?: boolean | string | string[] | Param[] | Param[][];
};
interface MethodParamsInterface {
    method: string;
    params: Param[];
    to?: string | Variable;
}
type CallType = keyof typeof CALL_TYPE;
interface CallOptions {
    permissions?: string;
    gasLimit?: string;
    flow?: Flow;
    jumpOnSuccess?: string;
    jumpOnFail?: string;
    falseMeansFail?: boolean;
    callType?: CallType;
    validation?: string;
    payerIndex?: number;
}
interface IPluginCall {
    value?: string | Variable;
    to: string | Variable;
    method: string;
    params: Param[];
    options?: CallOptions;
}

type DeepRequired<T> = T extends object ? {
    [P in keyof T]-?: DeepRequired<T[P]>;
} : T;
type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;
type RequiredKeys<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

interface ITxValidator {
    rpcUrl: string;
    callData: string;
    actuatorPrivateKey: string;
    actuatorContractAddress: string;
    activateForFree: boolean;
    gasPrice: EIP1559GasPrice;
    errorIsValid?: boolean;
}
interface EIP1559GasPrice {
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
}

interface FetchUtilConstructor {
    rpcUrl?: string;
    provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
    chainId: number | string;
}
declare class FetchUtility {
    chainId: number;
    private readonly multicallContract;
    constructor({ rpcUrl, chainId, provider }: FetchUtilConstructor);
    fetchCurrentApprovals(data: IRequiredApproval[]): Promise<(IRequiredApproval & {
        value: string | boolean;
    })[]>;
    getTokensTotalSupply(requiredApprovals: IRequiredApproval[]): Promise<Record<string, string>>;
}

declare const fetchCurrentApprovals: ({ rpcUrl, provider, chainId, multicallContract, multicallContractAddress, data, }: {
    rpcUrl?: string | undefined;
    provider?: ethers.providers.Provider | undefined;
    chainId?: string | number | undefined;
    multicallContract?: ethers.Contract | undefined;
    multicallContractAddress?: string | undefined;
    data: IRequiredApproval[];
}) => Promise<(IRequiredApproval & {
    value: string | boolean;
})[]>;

declare const getGasPrices: ({ rpcUrl, chainId, historicalBlocks, tries, }: {
    rpcUrl: string;
    chainId: number;
    historicalBlocks?: number | undefined;
    tries?: number | undefined;
}) => Promise<Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>>;

declare const getKIROPrice: ({ chainId, rpcUrl, provider, blockTimestamp, }: {
    chainId: number;
    rpcUrl?: string | undefined;
    provider?: ethers.providers.Provider | undefined;
    blockTimestamp?: number | undefined;
}) => Promise<string>;

interface TransactionValidatorSuccess {
    isValid: true;
    txData: {
        gas: number;
        type: 2;
    } & EIP1559GasPrice;
    prices: {
        gas: number;
        gasPrice: string;
    };
    error: null;
}
interface TransactionValidatorError {
    isValid: false;
    txData: {
        gas: number;
        type: 2;
    } & EIP1559GasPrice;
    prices: {
        gas: number;
        gasPrice: string;
    };
    error: string;
}
type TransactionValidatorResult = TransactionValidatorSuccess | TransactionValidatorError;

declare const transactionValidator: (txVal: ITxValidator) => Promise<TransactionValidatorResult>;

type index_FetchUtility = FetchUtility;
declare const index_FetchUtility: typeof FetchUtility;
declare const index_fetchCurrentApprovals: typeof fetchCurrentApprovals;
declare const index_getGasPrices: typeof getGasPrices;
declare const index_getKIROPrice: typeof getKIROPrice;
declare const index_transactionValidator: typeof transactionValidator;
declare namespace index {
  export {
    index_FetchUtility as FetchUtility,
    index_fetchCurrentApprovals as fetchCurrentApprovals,
    index_getGasPrices as getGasPrices,
    index_getKIROPrice as getKIROPrice,
    index_transactionValidator as transactionValidator,
  };
}

export { BatchMultiSigCall, BatchMultiSigCallConstructor, BatchMultiSigCallTypedData, CallOptions, CallType, DecodedCalls, DeepPartial, DeepRequired, EIP1559GasPrice, FCTCall, FCTCallParam, FCTInputCall, FCTMCall, ICallDefaults, IFCT, IFCTOptions, IMSCallInput, IMSCallWithEncodedData, IPluginCall, IRequiredApproval, ITxValidator, IWithPlugin, MSCall, MSCallBase, MandatoryTypedDataMessage, MessageComputed, MessageEngine, MessageLimits, MessageMeta, MessageMultiSig, MessageRecurrency, MessageTransaction, MessageValidation, MethodParamsInterface, OptionalTypedDataMessage, Param, ParamValue, ParamWithoutVariable, RequiredFCTOptions, RequiredKeys, StrictMSCallInput, TypedDataDomain, TypedDataEngine, TypedDataLimits, TypedDataMessage, TypedDataMessageTransaction, TypedDataMeta, TypedDataMultiSig, TypedDataRecurrency, TypedDataTypes, Variable, index$2 as constants, index as utils, index$1 as variables };
