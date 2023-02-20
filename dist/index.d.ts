import * as _kirobo_ki_eth_fct_provider_ts from '@kirobo/ki-eth-fct-provider-ts';
import { ChainId, AllPlugins, PluginInstance, getPlugin as getPlugin$1 } from '@kirobo/ki-eth-fct-provider-ts';
export * from '@kirobo/ki-eth-fct-provider-ts';
export { utils as pluginUtils } from '@kirobo/ki-eth-fct-provider-ts';
import * as ethers from 'ethers';
import { ethers as ethers$1 } from 'ethers';
export { ethers } from 'ethers';
import { SignatureLike } from '@ethersproject/bytes';
import { JsonFragment } from '@ethersproject/abi';
import { Fragment } from 'ethers/lib/utils';
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
declare const flows: {
    OK_CONT_FAIL_REVERT: {
        text: string;
        value: string;
    };
    OK_CONT_FAIL_STOP: {
        text: string;
        value: string;
    };
    OK_CONT_FAIL_CONT: {
        text: string;
        value: string;
    };
    OK_REVERT_FAIL_CONT: {
        text: string;
        value: string;
    };
    OK_REVERT_FAIL_STOP: {
        text: string;
        value: string;
    };
    OK_STOP_FAIL_CONT: {
        text: string;
        value: string;
    };
    OK_STOP_FAIL_REVERT: {
        text: string;
        value: string;
    };
    OK_STOP_FAIL_STOP: {
        text: string;
        value: string;
    };
};

declare const multicallContracts: {
    1: string;
    5: string;
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
declare const CALL_TYPE: {
    ACTION: string;
    VIEW_ONLY: string;
    LIBRARY: string;
};
declare const CALL_TYPE_MSG: {
    ACTION: string;
    VIEW_ONLY: string;
    LIBRARY: string;
};
declare const FCT_VAULT_ADDRESS: "FCT_VAULT_ADDRESS";

type index_d$5_Flow = Flow;
declare const index_d$5_Flow: typeof Flow;
declare const index_d$5_flows: typeof flows;
declare const index_d$5_multicallContracts: typeof multicallContracts;
declare const index_d$5_nullValue: typeof nullValue;
declare const index_d$5_FCBase: typeof FCBase;
declare const index_d$5_FCBaseBytes: typeof FCBaseBytes;
declare const index_d$5_FDBase: typeof FDBase;
declare const index_d$5_FDBaseBytes: typeof FDBaseBytes;
declare const index_d$5_FDBackBase: typeof FDBackBase;
declare const index_d$5_FDBackBaseBytes: typeof FDBackBaseBytes;
declare const index_d$5_ComputedBase: typeof ComputedBase;
declare const index_d$5_ComputedBaseBytes: typeof ComputedBaseBytes;
declare const index_d$5_CALL_TYPE: typeof CALL_TYPE;
declare const index_d$5_CALL_TYPE_MSG: typeof CALL_TYPE_MSG;
declare const index_d$5_FCT_VAULT_ADDRESS: typeof FCT_VAULT_ADDRESS;
declare namespace index_d$5 {
  export {
    index_d$5_Flow as Flow,
    index_d$5_flows as flows,
    index_d$5_multicallContracts as multicallContracts,
    index_d$5_nullValue as nullValue,
    index_d$5_FCBase as FCBase,
    index_d$5_FCBaseBytes as FCBaseBytes,
    index_d$5_FDBase as FDBase,
    index_d$5_FDBaseBytes as FDBaseBytes,
    index_d$5_FDBackBase as FDBackBase,
    index_d$5_FDBackBaseBytes as FDBackBaseBytes,
    index_d$5_ComputedBase as ComputedBase,
    index_d$5_ComputedBaseBytes as ComputedBaseBytes,
    index_d$5_CALL_TYPE as CALL_TYPE,
    index_d$5_CALL_TYPE_MSG as CALL_TYPE_MSG,
    index_d$5_FCT_VAULT_ADDRESS as FCT_VAULT_ADDRESS,
  };
}

type GlobalVariable = "blockNumber" | "blockTimestamp" | "gasPrice" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
declare const globalVariables: {
    blockNumber: string;
    blockTimestamp: string;
    gasPrice: string;
    minerAddress: string;
    originAddress: string;
    investorAddress: string;
    activatorAddress: string;
    engineAddress: string;
};
declare const getBlockNumber: () => Variable;
declare const getBlockTimestamp: () => Variable;
declare const getGasPrice: () => Variable;
declare const getMinerAddress: () => Variable;
declare const getOriginAddress: () => Variable;
declare const getInvestorAddress: () => Variable;
declare const getActivatorAddress: () => Variable;
declare const getEngineAddress: () => Variable;

type index_d$4_GlobalVariable = GlobalVariable;
declare const index_d$4_globalVariables: typeof globalVariables;
declare const index_d$4_getBlockNumber: typeof getBlockNumber;
declare const index_d$4_getBlockTimestamp: typeof getBlockTimestamp;
declare const index_d$4_getGasPrice: typeof getGasPrice;
declare const index_d$4_getMinerAddress: typeof getMinerAddress;
declare const index_d$4_getOriginAddress: typeof getOriginAddress;
declare const index_d$4_getInvestorAddress: typeof getInvestorAddress;
declare const index_d$4_getActivatorAddress: typeof getActivatorAddress;
declare const index_d$4_getEngineAddress: typeof getEngineAddress;
declare namespace index_d$4 {
  export {
    index_d$4_GlobalVariable as GlobalVariable,
    index_d$4_globalVariables as globalVariables,
    index_d$4_getBlockNumber as getBlockNumber,
    index_d$4_getBlockTimestamp as getBlockTimestamp,
    index_d$4_getGasPrice as getGasPrice,
    index_d$4_getMinerAddress as getMinerAddress,
    index_d$4_getOriginAddress as getOriginAddress,
    index_d$4_getInvestorAddress as getInvestorAddress,
    index_d$4_getActivatorAddress as getActivatorAddress,
    index_d$4_getEngineAddress as getEngineAddress,
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
    id: IComputed;
};
interface Param {
    name: string;
    type: string;
    value?: boolean | string | string[] | Param[] | Param[][] | Variable;
    customType?: boolean;
    hashed?: boolean;
}
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

interface TransactionValidatorSuccess {
    isValid: true;
    txData: {
        gas: number;
        type: 2;
    } & EIP1559GasPrice;
    prices: {
        gas: number;
        gasPrice: number;
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
        gasPrice: number;
    };
    error: string;
}
type TransactionValidatorResult = TransactionValidatorSuccess | TransactionValidatorError;
declare const transactionValidator: (txVal: ITxValidator, pureGas?: boolean) => Promise<TransactionValidatorResult>;
declare const getGasPrices: ({ rpcUrl, historicalBlocks, tries, }: {
    rpcUrl: string;
    historicalBlocks?: number | undefined;
    tries?: number | undefined;
}) => Promise<Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>>;
declare const estimateFCTGasCost: ({ fct, callData, batchMultiSigCallAddress, rpcUrl, }: {
    fct: PartialBatchMultiSigCall;
    callData: string;
    batchMultiSigCallAddress: string;
    rpcUrl: string;
}) => Promise<string>;
declare const getKIROPayment: ({ fct, kiroPriceInETH, gasPrice, gas, }: {
    fct: PartialBatchMultiSigCall;
    kiroPriceInETH: string;
    gasPrice: number;
    gas: number;
}) => {
    vault: string;
    amountInKIRO: string;
    amountInETH: string;
};
declare const getPaymentPerPayer: ({ fct, gasPrice, kiroPriceInETH, penalty, }: {
    fct: IBatchMultiSigCallFCT;
    gasPrice?: number | undefined;
    kiroPriceInETH: string;
    penalty?: number | undefined;
}) => {
    payer: string;
    amount: string;
    amountInETH: string;
}[];

type GasPriority = keyof Awaited<ReturnType<typeof getGasPrices>>;
interface ITxValidator {
    rpcUrl: string;
    callData: string;
    actuatorPrivateKey: string;
    actuatorContractAddress: string;
    activateForFree: boolean;
    gasPrice: EIP1559GasPrice;
}
interface EIP1559GasPrice {
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
}
interface LegacyGasPrice {
    gasPrice: number;
}
type GasPrice = EIP1559GasPrice | LegacyGasPrice;

interface IComputedVariable {
    index: string;
    var: string;
    add: string;
    sub: string;
    mul: string;
    div: string;
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
        call_type: (typeof CALL_TYPE_MSG)[keyof typeof CALL_TYPE_MSG];
        from: string;
        to: string;
        to_ens: string;
        eth_value: string;
        gas_limit: string;
        permissions: number;
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
    builder: string;
    selector: string;
    version: string;
    random_id: string;
    eip712: boolean;
}
type MessageTransaction = Record<`transaction_${number}`, TypedDataMessageTransaction>;
type MessageMeta = Record<"meta", TypedDataMeta>;
type MessageLimits = Record<"limits", TypedDataLimits>;
type MessageRecurrency = Record<"recurrency", TypedDataRecurrency>;
type MessageMultiSig = Record<"multisig", TypedDataMultiSig>;
type MessageComputed = Record<`computed_${number}`, IComputedVariable>;
type MandatoryTypedDataMessage = MessageTransaction & MessageMeta & MessageLimits;
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
}
interface IBatchMultiSigCallFCT {
    typeHash: string;
    typedData: BatchMultiSigCallTypedData;
    sessionId: string;
    nameHash: string;
    mcall: MSCall[];
    builder: string;
    variables: string[];
    externalSigners: string[];
    computed: {
        variable: string;
        add: string;
        sub: string;
        mul: string;
        div: string;
    }[];
    signatures: SignatureLike[];
}
type PartialBatchMultiSigCall = Pick<IBatchMultiSigCallFCT, "typedData" | "signatures" | "mcall">;
interface MSCallMandatory {
    nodeId?: string;
    from?: string | Variable;
    value?: string | Variable;
    options?: CallOptions;
}
type IMSCallInput = {
    to: string | Variable;
    params?: Param[];
    method?: string;
    toENS?: string;
} & MSCallMandatory;
type IMSCallInputWithNodeId = RequiredKeys<IMSCallInput, "nodeId">;
type StrictMSCallInput = RequiredKeys<IMSCallInput, "from" | "value" | "nodeId" | "options"> & {
    options: DeepRequired<CallOptions>;
};
type IWithPlugin = {
    plugin: {
        create(): Promise<IPluginCall | undefined>;
    };
} & MSCallMandatory;
type IMSCallWithEncodedData = {
    nodeId?: string;
    abi: ReadonlyArray<Fragment | JsonFragment>;
    encodedData: string;
    to: string | Variable;
} & MSCallMandatory;
type FCTCall = IMSCallInput | IWithPlugin | IMSCallWithEncodedData;
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
    name?: string;
    validFrom: string;
    expiresAt: string;
    maxGasPrice: string;
    blockable: boolean;
    purgeable: boolean;
    builder: string;
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
interface IComputed {
    variable: string | Variable;
    add?: string;
    sub?: string;
    mul?: string;
    div?: string;
}
interface ComputedVariables {
    variable: string;
    add: string;
    sub: string;
    mul: string;
    div: string;
}
interface IRequiredApproval {
    requiredAmount: string;
    token: string;
    spender: string;
    from: string;
}

declare const recoverAddressFromEIP712: (typedData: BatchMultiSigCallTypedData, signature: SignatureLike) => string | null;
declare const getFCTMessageHash: (typedData: BatchMultiSigCallTypedData) => string;
declare const validateFCT: <IFCT extends IBatchMultiSigCallFCT>(FCT: IFCT, softValidation?: boolean) => {
    getOptions: () => {
        valid_from: string;
        expires_at: string;
        gas_price_limit: string;
        blockable: boolean;
        purgeable: boolean;
        builder: string;
        recurrency: Partial<{
            maxRepeats: string;
            chillTime: string;
            accumetable: boolean;
        }>;
        multisig: {
            externalSigners?: string[] | undefined;
            minimumApprovals?: string | undefined;
        };
    };
    getFCTMessageHash: () => string;
    getSigners: () => string[];
};
declare const getVariablesAsBytes32: (variables: string[]) => string[];
declare const getAllFCTPaths: (fct: PartialBatchMultiSigCall) => string[][];

declare const fetchCurrentApprovals: ({ rpcUrl, provider, data, }: {
    rpcUrl?: string | undefined;
    provider?: ethers$1.providers.JsonRpcProvider | ethers$1.providers.Web3Provider | undefined;
    data: {
        token: string;
        from: string;
        spender: string;
        requiredAmount?: string;
    }[];
}) => Promise<{
    value: string;
    token: string;
    from: string;
    spender: string;
    requiredAmount?: string | undefined;
}[]>;

declare const index_d$3_recoverAddressFromEIP712: typeof recoverAddressFromEIP712;
declare const index_d$3_getFCTMessageHash: typeof getFCTMessageHash;
declare const index_d$3_validateFCT: typeof validateFCT;
declare const index_d$3_getVariablesAsBytes32: typeof getVariablesAsBytes32;
declare const index_d$3_getAllFCTPaths: typeof getAllFCTPaths;
declare const index_d$3_fetchCurrentApprovals: typeof fetchCurrentApprovals;
declare const index_d$3_transactionValidator: typeof transactionValidator;
declare const index_d$3_getGasPrices: typeof getGasPrices;
declare const index_d$3_estimateFCTGasCost: typeof estimateFCTGasCost;
declare const index_d$3_getKIROPayment: typeof getKIROPayment;
declare const index_d$3_getPaymentPerPayer: typeof getPaymentPerPayer;
declare namespace index_d$3 {
  export {
    index_d$3_recoverAddressFromEIP712 as recoverAddressFromEIP712,
    index_d$3_getFCTMessageHash as getFCTMessageHash,
    index_d$3_validateFCT as validateFCT,
    index_d$3_getVariablesAsBytes32 as getVariablesAsBytes32,
    index_d$3_getAllFCTPaths as getAllFCTPaths,
    index_d$3_fetchCurrentApprovals as fetchCurrentApprovals,
    index_d$3_transactionValidator as transactionValidator,
    index_d$3_getGasPrices as getGasPrices,
    index_d$3_estimateFCTGasCost as estimateFCTGasCost,
    index_d$3_getKIROPayment as getKIROPayment,
    index_d$3_getPaymentPerPayer as getPaymentPerPayer,
  };
}

declare function verifyCall(this: BatchMultiSigCall, call: IMSCallInput): void;

declare function create(this: BatchMultiSigCall, callInput: FCTCall): Promise<IMSCallInputWithNodeId>;
declare function createMultiple(this: BatchMultiSigCall, calls: FCTCall[]): Promise<IMSCallInputWithNodeId[]>;
declare function createWithPlugin(this: BatchMultiSigCall, callWithPlugin: IWithPlugin): Promise<IMSCallInputWithNodeId>;
declare function createWithEncodedData(this: BatchMultiSigCall, callWithEncodedData: IMSCallWithEncodedData): Promise<IMSCallInputWithNodeId>;
declare function createPlugin(this: BatchMultiSigCall, Plugin: AllPlugins): _kirobo_ki_eth_fct_provider_ts.NewPluginType<"UNISWAP", "ACTION", "addLiquidityETH", string, {
    input: {
        to: _kirobo_ki_eth_fct_provider_ts.FctAddress;
        value: _kirobo_ki_eth_fct_provider_ts.FctValue;
        methodParams: {
            token: _kirobo_ki_eth_fct_provider_ts.FctAddress;
            amountTokenDesired: _kirobo_ki_eth_fct_provider_ts.FctValue;
            amountTokenMin: _kirobo_ki_eth_fct_provider_ts.FctValue;
            amountETHMin: _kirobo_ki_eth_fct_provider_ts.FctValue;
            to: _kirobo_ki_eth_fct_provider_ts.FctAddress;
            deadline: _kirobo_ki_eth_fct_provider_ts.FctValue;
        };
    };
    output: {
        amountA: _kirobo_ki_eth_fct_provider_ts.FctValue;
        amountB: _kirobo_ki_eth_fct_provider_ts.FctValue;
        liquidity: _kirobo_ki_eth_fct_provider_ts.FctValue;
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
declare function getCall(this: BatchMultiSigCall, index: number): IMSCallInput;
declare function exportFCT(this: BatchMultiSigCall): IBatchMultiSigCallFCT;
declare function importFCT(this: BatchMultiSigCall, fct: IBatchMultiSigCallFCT): IMSCallInput[];
declare function importEncodedFCT(this: BatchMultiSigCall, calldata: string): Promise<RequiredKeys<IMSCallInput, "nodeId">[]>;
declare function setFromAddress(this: BatchMultiSigCall, address: string): void;

declare function getAllRequiredApprovals(this: BatchMultiSigCall): IRequiredApproval[];
declare function setOptions(this: BatchMultiSigCall, options: DeepPartial<IFCTOptions>): IFCTOptions | undefined;
declare function createTypedData(this: BatchMultiSigCall, salt: string, version: string): BatchMultiSigCallTypedData;
declare function getParamsFromCall(this: BatchMultiSigCall, call: IMSCallInput, index: number): Record<string, FCTCallParam>;
declare function verifyParams(this: BatchMultiSigCall, params: Param[]): void;
declare function handleTo(this: BatchMultiSigCall, call: IMSCallInput): string;
declare function handleValue(this: BatchMultiSigCall, call: IMSCallInput): string;

declare function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance>;
declare function getPluginClass(this: BatchMultiSigCall, index: number): Promise<ReturnType<typeof getPlugin$1>>;
declare function getPluginData(this: BatchMultiSigCall, index: number): Promise<{
    protocol: "SUSHISWAP" | "UNISWAP" | "VALIDATOR" | "ERC20" | "ERC721" | "ERC1155" | "MATH" | "TOKEN_MATH" | "TOKEN_VALIDATOR" | "AAVE" | "UTILITY" | "PARASWAP" | "YEARN" | "COMPOUND_V2" | "COMPOUND_V3" | "1INCH" | "CURVE" | "CHAINLINK" | "UNISWAP_V3";
    type: "ACTION" | "LIBRARY" | "GETTER" | "VALIDATOR" | "CALCULATOR" | "ORACLE";
    method: "" | "symbol" | "name" | "add" | "sub" | "mul" | "div" | "getAmountsOut" | "decimals" | "deposit" | "simpleSwap" | "swap" | "addLiquidityETH" | "removeLiquidityETH" | "withdraw" | "transferFrom" | "safeTransferFrom" | "setApprovalForAll" | "getAmountsIn" | "totalSupply" | "balanceOf" | "isApprovedForAll" | "supportsInterface" | "borrow" | "approve" | "mod" | "between" | "betweenEqual" | "equal" | "greaterEqual" | "greaterThan" | "lessEqual" | "lessThan" | "add_liquidity" | "remove_liquidity" | "swapExactTokensForTokens" | "swapExactETHForTokens" | "swapExactTokensForETH" | "swapTokensForExactTokens" | "swapTokensForExactETH" | "swapETHForExactTokens" | "simpleRemoveLiquidity" | "uniswapV3SwapTo" | "uniswapV3Swap" | "uniswapV3SwapToWithPermit" | "unoswap" | "repay" | "swapBorrowRateMode" | "flashLoan" | "buyOnUniswapV2Fork" | "megaSwap" | "multiSwap" | "simpleBuy" | "swapOnUniswapV2Fork" | "exchange" | "swapOnZeroXv4" | "mint" | "redeem" | "repayBorrow" | "enterMarkets" | "exitMarket" | "claimComp" | "supply" | "supplyFrom" | "supplyTo" | "withdrawFrom" | "withdrawTo" | "exchange_with_best_rate" | "remove_liquidity_one_coin" | "create_lock" | "increase_amount" | "increase_unlock_time" | "transfer" | "safeBatchTransferFrom" | "swapTo_noSlippageProtection" | "swap_noSlippageProtection" | "addLiquidity_noMinProtection" | "addLiquidityTo_noMinProtection" | "exactInput" | "exactInputSingle" | "exactOutput" | "exactOutputSingle" | "burn" | "increaseLiquidity" | "decreaseLiquidity" | "collect" | "getReserves" | "getUserAccountData" | "getReserveData" | "getUserReserveData" | "getReserveConfigurationData" | "getReserveTokensAddresses" | "getAssetPrice" | "latestRoundData" | "getAccountLiquidity" | "markets" | "borrowBalanceCurrent" | "collateralBalanceOf" | "isBorrowCollateralized" | "userBasic" | "borrowBalanceOf" | "getAssetInfoByAddress" | "getPrice" | "get_best_rate" | "get_exchange_amount" | "calc_token_amount" | "get_dy" | "locked" | "allowance" | "getApproved" | "ownerOf" | "tokenURI" | "balanceOfBatch" | "uri" | "simulateSwap" | "mulAndDiv" | "equalBytes32" | "positions" | "protocolFees" | "slot0" | "ticks" | "getEthBalance";
    input: {
        to: string | Variable;
        value: string | Variable | undefined;
        methodParams: {};
    };
}>;

declare function getVariable(this: BatchMultiSigCall, variable: Variable, type: string): string;
declare function getOutputVariable(this: BatchMultiSigCall, index: number, innerIndex: number, type: string): string;
declare function getExternalVariable(this: BatchMultiSigCall, index: number, type: string): string;
declare function getComputedVariable(this: BatchMultiSigCall, index: number, type: string): string;

declare class BatchMultiSigCall {
    protected FCT_Controller: ethers$1.utils.Interface;
    protected FCT_BatchMultiSigCall: ethers$1.utils.Interface;
    protected batchMultiSigSelector: string;
    protected version: string;
    protected chainId: ChainId;
    fromAddress: string;
    protected computedVariables: ComputedVariables[];
    protected calls: RequiredKeys<IMSCallInput, "nodeId">[];
    protected _options: IFCTOptions;
    constructor(input?: BatchMultiSigCallConstructor);
    get options(): RequiredFCTOptions;
    get strictCalls(): StrictMSCallInput[];
    setOptions: typeof setOptions;
    setFromAddress: typeof setFromAddress;
    getPlugin: typeof getPlugin;
    getPluginClass: typeof getPluginClass;
    createPlugin: typeof createPlugin;
    create: typeof create;
    createWithEncodedData: typeof createWithEncodedData;
    createWithPlugin: typeof createWithPlugin;
    createMultiple: typeof createMultiple;
    exportFCT: typeof exportFCT;
    importFCT: typeof importFCT;
    importEncodedFCT: typeof importEncodedFCT;
    getCall: typeof getCall;
    getPluginData: typeof getPluginData;
    getAllRequiredApprovals: typeof getAllRequiredApprovals;
    protected getVariable: typeof getVariable;
    protected getOutputVariable: typeof getOutputVariable;
    protected getExternalVariable: typeof getExternalVariable;
    protected getComputedVariable: typeof getComputedVariable;
    protected createTypedData: typeof createTypedData;
    protected getParamsFromCall: typeof getParamsFromCall;
    protected verifyParams: typeof verifyParams;
    protected handleTo: typeof handleTo;
    protected handleValue: typeof handleValue;
    protected verifyCall: typeof verifyCall;
}

declare const addresses: {
    1: {
        FCT_Controller: string;
        FCT_BatchMultiSig: string;
        FCT_EnsManager: string;
        FCT_Tokenomics: string;
        Actuator: string;
        ActuatorCore: string;
    };
    5: {
        FCT_Controller: string;
        FCT_BatchMultiSig: string;
        FCT_EnsManager: string;
        FCT_Tokenomics: string;
        Actuator: string;
        ActuatorCore: string;
    };
};
declare const EIP712_RECURRENCY: {
    name: string;
    type: string;
}[];
declare const EIP712_MULTISIG: {
    name: string;
    type: string;
}[];
declare const NO_JUMP = "NO_JUMP";
declare const DEFAULT_CALL_OPTIONS: DeepRequired<CallOptions>;

declare const verifyOptions: (options: Partial<IFCTOptions>) => void;
declare const verifyParam: (param: Param) => void;

type EIP712Types = Record<string, {
    name: string;
    type: string;
}[]>;
declare const getTxEIP712Types: (calls: IMSCallInput[]) => {
    txTypes: EIP712Types;
    structTypes: EIP712Types;
};
declare const getUsedStructTypes: (typedData: BatchMultiSigCallTypedData, typeName: string) => string[];
declare const getComputedVariableMessage: (computedVariables: ComputedVariables[]) => Record<`computed_${number}`, IComputedVariable>;

declare const handleMethodInterface: (call: IMSCallInput) => string;
declare const handleFunctionSignature: (call: IMSCallInput) => string;
declare const handleEnsHash: (call: IMSCallInput) => string;
declare const handleData: (call: IMSCallInput) => string;
declare const handleTypes: (call: IMSCallInput) => number[];
declare const handleTypedHashes: (call: IMSCallInput, typedData: BatchMultiSigCallTypedData) => string[];

declare const manageCallId: (calls: IMSCallInput[], call: StrictMSCallInput, index: number) => string;
declare const getSessionId: (salt: string, versionHex: string, options: RequiredFCTOptions) => string;
declare const parseSessionID: (sessionId: string, builder: string) => {
    builder: string;
    recurrency: Partial<{
        maxRepeats: string;
        chillTime: string;
        accumetable: boolean;
    }>;
    multisig: {
        externalSigners?: string[] | undefined;
        minimumApprovals?: string | undefined;
    };
    validFrom: string;
    expiresAt: string;
    maxGasPrice: string;
    blockable: boolean;
    purgeable: boolean;
};
declare const parseCallID: (callId: string, jumpsAsNumbers?: boolean) => {
    options: {
        gasLimit: string;
        flow: Flow;
        jumpOnSuccess?: string | number | undefined;
        jumpOnFail?: string | number | undefined;
    };
    viewOnly: boolean;
    permissions: string;
    payerIndex: number;
    callIndex: number;
};

declare const index_d$2_verifyOptions: typeof verifyOptions;
declare const index_d$2_verifyParam: typeof verifyParam;
declare const index_d$2_getTxEIP712Types: typeof getTxEIP712Types;
declare const index_d$2_getUsedStructTypes: typeof getUsedStructTypes;
declare const index_d$2_getComputedVariableMessage: typeof getComputedVariableMessage;
declare const index_d$2_handleMethodInterface: typeof handleMethodInterface;
declare const index_d$2_handleFunctionSignature: typeof handleFunctionSignature;
declare const index_d$2_handleEnsHash: typeof handleEnsHash;
declare const index_d$2_handleData: typeof handleData;
declare const index_d$2_handleTypes: typeof handleTypes;
declare const index_d$2_handleTypedHashes: typeof handleTypedHashes;
declare const index_d$2_manageCallId: typeof manageCallId;
declare const index_d$2_getSessionId: typeof getSessionId;
declare const index_d$2_parseSessionID: typeof parseSessionID;
declare const index_d$2_parseCallID: typeof parseCallID;
declare namespace index_d$2 {
  export {
    index_d$2_verifyOptions as verifyOptions,
    index_d$2_verifyParam as verifyParam,
    index_d$2_getTxEIP712Types as getTxEIP712Types,
    index_d$2_getUsedStructTypes as getUsedStructTypes,
    index_d$2_getComputedVariableMessage as getComputedVariableMessage,
    index_d$2_handleMethodInterface as handleMethodInterface,
    index_d$2_handleFunctionSignature as handleFunctionSignature,
    index_d$2_handleEnsHash as handleEnsHash,
    index_d$2_handleData as handleData,
    index_d$2_handleTypes as handleTypes,
    index_d$2_handleTypedHashes as handleTypedHashes,
    index_d$2_manageCallId as manageCallId,
    index_d$2_getSessionId as getSessionId,
    index_d$2_parseSessionID as parseSessionID,
    index_d$2_parseCallID as parseCallID,
  };
}

declare function getCalldataForActuator({ signedFCT, purgedFCT, investor, activator, version, }: {
    signedFCT: IBatchMultiSigCallFCT;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
}): string;

declare const getAuthenticatorSignature: (typedData: BatchMultiSigCallTypedData) => ethers.Signature;

declare const index_d$1_getCalldataForActuator: typeof getCalldataForActuator;
declare const index_d$1_getAuthenticatorSignature: typeof getAuthenticatorSignature;
declare namespace index_d$1 {
  export {
    index_d$1_getCalldataForActuator as getCalldataForActuator,
    index_d$1_getAuthenticatorSignature as getAuthenticatorSignature,
  };
}

type index_d_BatchMultiSigCall = BatchMultiSigCall;
declare const index_d_BatchMultiSigCall: typeof BatchMultiSigCall;
declare const index_d_addresses: typeof addresses;
declare const index_d_EIP712_RECURRENCY: typeof EIP712_RECURRENCY;
declare const index_d_EIP712_MULTISIG: typeof EIP712_MULTISIG;
declare const index_d_NO_JUMP: typeof NO_JUMP;
declare const index_d_DEFAULT_CALL_OPTIONS: typeof DEFAULT_CALL_OPTIONS;
declare namespace index_d {
  export {
    index_d_BatchMultiSigCall as BatchMultiSigCall,
    index_d$2 as helpers,
    index_d$1 as utils,
    index_d_addresses as addresses,
    index_d_EIP712_RECURRENCY as EIP712_RECURRENCY,
    index_d_EIP712_MULTISIG as EIP712_MULTISIG,
    index_d_NO_JUMP as NO_JUMP,
    index_d_DEFAULT_CALL_OPTIONS as DEFAULT_CALL_OPTIONS,
  };
}

export { BatchMultiSigCall, BatchMultiSigCallConstructor, BatchMultiSigCallTypedData, CallOptions, CallType, ComputedVariables, DeepPartial, DeepRequired, EIP1559GasPrice, index_d as FCTBatchMultiSigCall, FCTCall, FCTCallParam, GasPrice, GasPriority, IBatchMultiSigCallFCT, IComputed, IComputedVariable, IFCTOptions, IMSCallInput, IMSCallInputWithNodeId, IMSCallWithEncodedData, IPluginCall, IRequiredApproval, ITxValidator, IWithPlugin, LegacyGasPrice, MSCall, MSCallMandatory, MandatoryTypedDataMessage, MessageComputed, MessageLimits, MessageMeta, MessageMultiSig, MessageRecurrency, MessageTransaction, MethodParamsInterface, OptionalTypedDataMessage, Param, PartialBatchMultiSigCall, RequiredFCTOptions, RequiredKeys, StrictMSCallInput, TypedDataDomain, TypedDataLimits, TypedDataMessage, TypedDataMessageTransaction, TypedDataMeta, TypedDataMultiSig, TypedDataRecurrency, TypedDataTypes, Variable, index_d$5 as constants, index_d$3 as utils, index_d$4 as variables };
