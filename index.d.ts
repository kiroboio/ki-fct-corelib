import * as _kiroboio_fct_plugins from '@kiroboio/fct-plugins';
import { ChainId, AllPlugins, PluginInstance, getPlugin as getPlugin$1 } from '@kiroboio/fct-plugins';
export * from '@kiroboio/fct-plugins';
export { utils as pluginUtils } from '@kiroboio/fct-plugins';
import * as ethers from 'ethers';
import { ethers as ethers$1 } from 'ethers';
export { ethers } from 'ethers';
import { JsonFragment } from '@ethersproject/abi';
import { SignatureLike } from '@ethersproject/bytes';
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
declare const CALL_TYPE_MSG_REV: {
    readonly action: "ACTION";
    readonly "view only": "VIEW_ONLY";
    readonly library: "LIBRARY";
};
declare const FCT_VAULT_ADDRESS: "FCT_VAULT_ADDRESS";

declare const index$3_CALL_TYPE: typeof CALL_TYPE;
declare const index$3_CALL_TYPE_MSG: typeof CALL_TYPE_MSG;
declare const index$3_CALL_TYPE_MSG_REV: typeof CALL_TYPE_MSG_REV;
declare const index$3_ComputedBase: typeof ComputedBase;
declare const index$3_ComputedBaseBytes: typeof ComputedBaseBytes;
declare const index$3_FCBase: typeof FCBase;
declare const index$3_FCBaseBytes: typeof FCBaseBytes;
declare const index$3_FCT_VAULT_ADDRESS: typeof FCT_VAULT_ADDRESS;
declare const index$3_FDBackBase: typeof FDBackBase;
declare const index$3_FDBackBaseBytes: typeof FDBackBaseBytes;
declare const index$3_FDBase: typeof FDBase;
declare const index$3_FDBaseBytes: typeof FDBaseBytes;
type index$3_Flow = Flow;
declare const index$3_Flow: typeof Flow;
declare const index$3_flows: typeof flows;
declare const index$3_multicallContracts: typeof multicallContracts;
declare const index$3_nullValue: typeof nullValue;
declare namespace index$3 {
  export {
    index$3_CALL_TYPE as CALL_TYPE,
    index$3_CALL_TYPE_MSG as CALL_TYPE_MSG,
    index$3_CALL_TYPE_MSG_REV as CALL_TYPE_MSG_REV,
    index$3_ComputedBase as ComputedBase,
    index$3_ComputedBaseBytes as ComputedBaseBytes,
    index$3_FCBase as FCBase,
    index$3_FCBaseBytes as FCBaseBytes,
    index$3_FCT_VAULT_ADDRESS as FCT_VAULT_ADDRESS,
    index$3_FDBackBase as FDBackBase,
    index$3_FDBackBaseBytes as FDBackBaseBytes,
    index$3_FDBase as FDBase,
    index$3_FDBaseBytes as FDBaseBytes,
    index$3_Flow as Flow,
    index$3_flows as flows,
    index$3_multicallContracts as multicallContracts,
    index$3_nullValue as nullValue,
  };
}

declare const getVariablesAsBytes32: (variables: string[]) => string[];

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
    auth_enabled: boolean;
}
type MessageTransaction = Record<`transaction_${number}`, TypedDataMessageTransaction>;
type MessageMeta = Record<"meta", TypedDataMeta>;
type MessageLimits = Record<"limits", TypedDataLimits>;
type MessageRecurrency = Record<"recurrency", TypedDataRecurrency>;
type MessageMultiSig = Record<"multisig", TypedDataMultiSig>;
type MessageComputed = Record<`computed_${number}`, Omit<ComputedVariable, "index">>;
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
    defaults?: DeepPartial<ICallDefaults>;
    domain?: BatchMultiSigCallTypedData["domain"];
    version?: `0x${string}`;
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
    computed: Omit<ComputedVariable, "index">[];
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
interface DecodedCalls extends StrictMSCallInput {
    params?: ParamWithoutVariable[];
}
type IWithPlugin = {
    plugin: {
        create(): Promise<IPluginCall | undefined>;
    };
} & MSCallMandatory;
type IMSCallWithEncodedData = {
    nodeId?: string;
    abi: ReadonlyArray<Fragment | JsonFragment> | string[];
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
    authEnabled: boolean;
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
type IComputedValue = string | Variable;
interface IComputed {
    id?: string;
    value: IComputedValue;
    add?: IComputedValue;
    sub?: IComputedValue;
    pow?: IComputedValue;
    mul?: IComputedValue;
    div?: IComputedValue;
    mod?: IComputedValue;
}
interface ComputedVariable {
    index: string;
    value: string;
    add: string;
    sub: string;
    pow: string;
    mul: string;
    div: string;
    mod: string;
}
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
type ICallDefaults = Omit<RequiredKeys<MSCallMandatory, "value">, "nodeId"> & {
    options: DeepRequired<CallOptions>;
};

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

type index$2_GlobalVariable = GlobalVariable;
declare const index$2_getActivatorAddress: typeof getActivatorAddress;
declare const index$2_getBlockNumber: typeof getBlockNumber;
declare const index$2_getBlockTimestamp: typeof getBlockTimestamp;
declare const index$2_getEngineAddress: typeof getEngineAddress;
declare const index$2_getGasPrice: typeof getGasPrice;
declare const index$2_getInvestorAddress: typeof getInvestorAddress;
declare const index$2_getMinerAddress: typeof getMinerAddress;
declare const index$2_getOriginAddress: typeof getOriginAddress;
declare const index$2_globalVariables: typeof globalVariables;
declare namespace index$2 {
  export {
    index$2_GlobalVariable as GlobalVariable,
    index$2_getActivatorAddress as getActivatorAddress,
    index$2_getBlockNumber as getBlockNumber,
    index$2_getBlockTimestamp as getBlockTimestamp,
    index$2_getEngineAddress as getEngineAddress,
    index$2_getGasPrice as getGasPrice,
    index$2_getInvestorAddress as getInvestorAddress,
    index$2_getMinerAddress as getMinerAddress,
    index$2_getOriginAddress as getOriginAddress,
    index$2_globalVariables as globalVariables,
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
};
interface Param {
    name: string;
    type: string;
    value?: boolean | string | string[] | Param[] | Param[][] | Variable;
    customType?: boolean;
    hashed?: boolean;
}
interface ParamWithoutVariable extends Param {
    value?: boolean | string | string[] | Param[] | Param[][];
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
    maxFeePerGas: number;
    maxPriorityFeePerGas: number;
}

declare const fetchCurrentApprovals: ({ rpcUrl, provider, data, }: {
    rpcUrl?: string | undefined;
    provider?: ethers$1.providers.JsonRpcProvider | ethers$1.providers.Web3Provider | undefined;
    data: IRequiredApproval[];
}) => Promise<(IRequiredApproval & {
    value: string | boolean;
})[]>;
interface FetchUtilConstructor {
    rpcUrl?: string;
    provider?: ethers$1.providers.JsonRpcProvider | ethers$1.providers.Web3Provider;
    chainId: number | string;
}
declare class FetchUtility {
    chainId: number;
    private mutlicallContract;
    constructor({ rpcUrl, chainId, provider }: FetchUtilConstructor);
    fetchCurrentApprovals(data: IRequiredApproval[]): Promise<({
        value: any;
        protocol: "ERC20";
        method: "approve";
        params: {
            spender: string;
            amount: string;
        };
        token: string;
        from: string;
    } | {
        value: any;
        protocol: "ERC721";
        method: "approve";
        params: {
            spender: string;
            tokenId: string;
        };
        token: string;
        from: string;
    } | {
        value: any;
        protocol: "ERC721" | "ERC1155";
        method: "setApprovalForAll";
        params: {
            spender: string;
            approved: boolean;
            ids: string[];
        };
        token: string;
        from: string;
    } | {
        value: any;
        protocol: "AAVE";
        method: "approveDelegation";
        params: {
            delegatee: string;
            amount: string;
        };
        token: string;
        from: string;
    })[]>;
    getTokensTotalSupply(requiredApprovals: IRequiredApproval[]): Promise<Record<string, string>>;
}

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
declare const getGasPrices: ({ rpcUrl, chainId, historicalBlocks, tries, }: {
    rpcUrl: string;
    chainId: number;
    historicalBlocks?: number | undefined;
    tries?: number | undefined;
}) => Promise<Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>>;

declare const getExecutedPath: ({ rpcUrl, txHash, }: {
    rpcUrl: string;
    txHash: string;
}) => Promise<void>;

declare const getKIROPrice: ({ chainId, rpcUrl, provider, blockTimestamp, }: {
    chainId: number;
    rpcUrl?: string | undefined;
    provider?: ethers$1.providers.JsonRpcProvider | ethers$1.providers.Web3Provider | undefined;
    blockTimestamp?: number | undefined;
}) => Promise<string>;

type index$1_FetchUtility = FetchUtility;
declare const index$1_FetchUtility: typeof FetchUtility;
declare const index$1_fetchCurrentApprovals: typeof fetchCurrentApprovals;
declare const index$1_getExecutedPath: typeof getExecutedPath;
declare const index$1_getGasPrices: typeof getGasPrices;
declare const index$1_getKIROPrice: typeof getKIROPrice;
declare const index$1_getVariablesAsBytes32: typeof getVariablesAsBytes32;
declare const index$1_transactionValidator: typeof transactionValidator;
declare namespace index$1 {
  export {
    index$1_FetchUtility as FetchUtility,
    index$1_fetchCurrentApprovals as fetchCurrentApprovals,
    index$1_getExecutedPath as getExecutedPath,
    index$1_getGasPrices as getGasPrices,
    index$1_getKIROPrice as getKIROPrice,
    index$1_getVariablesAsBytes32 as getVariablesAsBytes32,
    index$1_transactionValidator as transactionValidator,
  };
}

declare class FCTBase {
    protected FCT: BatchMultiSigCall;
    constructor(FCT: BatchMultiSigCall);
}

declare const isInteger: (value: string, key: string) => void;
declare const isAddress: (value: string, key: string) => void;
declare const verifyParam: (param: Param) => void;
declare const getParamsFromInputs: (inputs: ethers$1.utils.ParamType[], values: ethers$1.utils.Result) => Param[];
declare const getParamsFromTypedData: ({ methodInterfaceParams, parameters, types, primaryType, }: {
    methodInterfaceParams: ethers$1.utils.ParamType[];
    parameters: Record<string, FCTCallParam>;
    types: TypedDataTypes;
    primaryType: string;
}) => Param[];

declare const helpers$1_getParamsFromInputs: typeof getParamsFromInputs;
declare const helpers$1_getParamsFromTypedData: typeof getParamsFromTypedData;
declare const helpers$1_isAddress: typeof isAddress;
declare const helpers$1_isInteger: typeof isInteger;
declare const helpers$1_verifyParam: typeof verifyParam;
declare namespace helpers$1 {
  export {
    helpers$1_getParamsFromInputs as getParamsFromInputs,
    helpers$1_getParamsFromTypedData as getParamsFromTypedData,
    helpers$1_isAddress as isAddress,
    helpers$1_isInteger as isInteger,
    helpers$1_verifyParam as verifyParam,
  };
}

declare class FCTCalls extends FCTBase {
    static helpers: typeof helpers$1;
    private _calls;
    private _callDefault;
    constructor(FCT: BatchMultiSigCall, callDefault?: DeepPartial<ICallDefaults>);
    get(): StrictMSCallInput[];
    getWithDecodedVariables(): DecodedCalls[];
    create(call: FCTCall): Promise<IMSCallInputWithNodeId>;
    createWithPlugin(callWithPlugin: IWithPlugin): Promise<IMSCallInputWithNodeId>;
    createWithEncodedData(callWithEncodedData: IMSCallWithEncodedData): Promise<IMSCallInputWithNodeId>;
    setCallDefaults(callDefault: DeepPartial<ICallDefaults>): ICallDefaults;
    private addCall;
    private verifyCall;
    decodeParams(params: Param[]): ParamWithoutVariable[];
}

declare class FCTUtils extends FCTBase {
    private _eip712;
    constructor(FCT: BatchMultiSigCall);
    get FCTData(): IBatchMultiSigCallFCT;
    getAllRequiredApprovals(): Promise<IRequiredApproval[]>;
    getCalldataForActuator({ signatures, purgedFCT, investor, activator, }: {
        signatures: SignatureLike[];
        purgedFCT: string;
        investor: string;
        activator: string;
    }): string;
    getAuthenticatorSignature(): SignatureLike;
    recoverAddress(signature: SignatureLike): string | null;
    getOptions(): {
        valid_from: string;
        expires_at: string;
        gas_price_limit: string;
        blockable: boolean;
        purgeable: boolean;
        builder: string;
        recurrency: {
            accumetable: boolean;
            chillTime: string;
            maxRepeats: string;
        };
        multisig: {
            externalSigners: string[];
            minimumApprovals: string;
        };
        authEnabled: boolean;
    };
    getMessageHash(): string;
    isValid(softValidation?: boolean): boolean | Error;
    getSigners(): string[];
    getAllPaths(): string[][];
    getKIROPayment: ({ priceOfETHInKiro, gasPrice, gas, }: {
        priceOfETHInKiro: string;
        gasPrice: number;
        gas: number;
    }) => {
        vault: string;
        amountInKIRO: string;
        amountInETH: string;
    };
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
    getPaymentPerPayer: ({ signatures, gasPrice, ethPriceInKIRO, penalty, fees, }: {
        signatures?: SignatureLike[] | undefined;
        gasPrice?: number | undefined;
        ethPriceInKIRO: string;
        penalty?: number | undefined;
        fees?: {
            baseFeeBPS?: number | undefined;
            bonusFeeBPS?: number | undefined;
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
    getCallResults: ({ rpcUrl, provider, txHash, }: {
        rpcUrl?: string | undefined;
        provider?: ethers$1.providers.JsonRpcProvider | ethers$1.providers.Web3Provider | undefined;
        txHash: string;
    }) => Promise<{
        index: string;
        result: "SUCCESS" | "FAILED" | "SKIPPED";
    }[]>;
    private validateFCTKeys;
}

declare const mustBeInteger: string[];
declare const mustBeAddress: string[];
declare const validateInteger: (value: string, keys: string[]) => void;
declare const validateAddress: (value: string, keys: string[]) => void;

declare const helpers_mustBeAddress: typeof mustBeAddress;
declare const helpers_mustBeInteger: typeof mustBeInteger;
declare const helpers_validateAddress: typeof validateAddress;
declare const helpers_validateInteger: typeof validateInteger;
declare namespace helpers {
  export {
    helpers_mustBeAddress as mustBeAddress,
    helpers_mustBeInteger as mustBeInteger,
    helpers_validateAddress as validateAddress,
    helpers_validateInteger as validateInteger,
  };
}

declare class Options {
    static helpers: typeof helpers;
    private _options;
    set(options: DeepPartial<IFCTOptions>): IFCTOptions;
    get(): RequiredFCTOptions;
    reset(): void;
    static verify(options: IFCTOptions): void;
    static validateOptionsValues: (value: Partial<IFCTOptions> | IFCTOptions["recurrency"] | IFCTOptions["multisig"], parentKeys?: string[]) => void;
    static fromObject(options: DeepPartial<IFCTOptions>): Options;
}

declare class Variables extends FCTBase {
    _computed: Required<IComputed>[];
    constructor(FCT: BatchMultiSigCall);
    get computed(): Required<IComputed>[];
    get computedWithValues(): {
        index: string;
        value: string;
        add: string;
        sub: string;
        mul: string;
        pow: string;
        div: string;
        mod: string;
    }[];
    addComputed(computed: IComputed): Variable & {
        type: "computed";
    };
    getVariable(variable: Variable, type: string): string;
    getOutputVariable(index: number, innerIndex: number, type: string): string;
    getExternalVariable(index: number, type: string): string;
    getComputedVariable(index: number, type: string): string;
    getValue(value: undefined | Variable | string, type: string, ifValueUndefined?: string): string;
}

declare function create(this: BatchMultiSigCall, call: FCTCall): Promise<IMSCallInputWithNodeId>;
declare function createMultiple(this: BatchMultiSigCall, calls: FCTCall[]): Promise<IMSCallInputWithNodeId[]>;
declare function createPlugin(this: BatchMultiSigCall, Plugin: AllPlugins): _kiroboio_fct_plugins.NewPluginType<"UNISWAP", "ACTION", "addLiquidityETH", string, {
    input: {
        to: _kiroboio_fct_plugins.FctAddress;
        value: _kiroboio_fct_plugins.FctValue;
        methodParams: {
            token: _kiroboio_fct_plugins.FctAddress;
            amountTokenDesired: _kiroboio_fct_plugins.FctValue;
            amountTokenMin: _kiroboio_fct_plugins.FctValue;
            amountETHMin: _kiroboio_fct_plugins.FctValue;
            to: _kiroboio_fct_plugins.FctAddress;
            deadline: _kiroboio_fct_plugins.FctTimestamp;
        };
    };
    output: {
        amountA: _kiroboio_fct_plugins.FctValue;
        amountB: _kiroboio_fct_plugins.FctValue;
        liquidity: _kiroboio_fct_plugins.FctValue;
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
declare function getCall(this: BatchMultiSigCall, index: number): IMSCallInput;
declare function exportFCT(this: BatchMultiSigCall): IBatchMultiSigCallFCT;
declare function importFCT(this: BatchMultiSigCall, fct: IBatchMultiSigCallFCT): IMSCallInput[];
declare function importEncodedFCT(this: BatchMultiSigCall, calldata: string): Promise<StrictMSCallInput[]>;

declare function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance>;
declare function getPluginClass(this: BatchMultiSigCall, index: number): Promise<ReturnType<typeof getPlugin$1>>;
declare function getPluginData(this: BatchMultiSigCall, index: number): Promise<{
    protocol: "ERC20" | "ERC721" | "ERC1155" | "AAVE" | "SUSHISWAP" | "UNISWAP" | "VALIDATOR" | "MATH" | "TOKEN_MATH" | "TOKEN_VALIDATOR" | "UTILITY" | "PARASWAP" | "YEARN" | "COMPOUND_V2" | "COMPOUND_V3" | "1INCH" | "CURVE" | "CHAINLINK" | "UNISWAP_V3" | "SECURE_STORAGE";
    type: "ACTION" | "LIBRARY" | "GETTER" | "VALIDATOR" | "CALCULATOR" | "ORACLE";
    method: "" | "symbol" | "add" | "sub" | "mul" | "div" | "mod" | "approve" | "setApprovalForAll" | "allowance" | "getApproved" | "isApprovedForAll" | "totalSupply" | "supportsInterface" | "name" | "getAmountsOut" | "decimals" | "deposit" | "simpleSwap" | "swap" | "addLiquidityETH" | "removeLiquidityETH" | "transferFrom" | "safeTransferFrom" | "withdraw" | "getAmountsIn" | "balanceOf" | "borrow" | "between" | "betweenEqual" | "equal" | "greaterEqual" | "greaterThan" | "lessEqual" | "lessThan" | "add_liquidity" | "remove_liquidity" | "swapExactTokensForTokens" | "swapExactETHForTokens" | "swapExactTokensForETH" | "swapTokensForExactTokens" | "swapTokensForExactETH" | "swapETHForExactTokens" | "simpleRemoveLiquidity" | "uniswapV3SwapTo" | "uniswapV3Swap" | "uniswapV3SwapToWithPermit" | "unoswap" | "repay" | "swapBorrowRateMode" | "buyOnUniswapV2Fork" | "megaSwap" | "multiSwap" | "simpleBuy" | "swapOnUniswapV2Fork" | "exchange" | "swapOnZeroXv4" | "transfer" | "simpleTransfer" | "safeBatchTransferFrom" | "swapTo_noSlippageProtection" | "swap_noSlippageProtection" | "addLiquidity_noMinProtection" | "addLiquidityTo_noMinProtection" | "mint" | "redeem" | "repayBorrow" | "enterMarkets" | "exitMarket" | "claimComp" | "supply" | "supplyFrom" | "supplyTo" | "withdrawFrom" | "withdrawTo" | "exchange_with_best_rate" | "remove_liquidity_one_coin" | "create_lock" | "increase_amount" | "increase_unlock_time" | "write_bytes" | "write_bytes32" | "write_fct_bytes" | "write_fct_bytes32" | "write_fct_uint256" | "write_uint256" | "exactInput" | "exactInputSingle" | "exactOutput" | "exactOutputSingle" | "burn" | "increaseLiquidity" | "decreaseLiquidity" | "collect" | "getReserves" | "getUserAccountData" | "getReserveData" | "getUserReserveData" | "getReserveConfigurationData" | "getReserveTokensAddresses" | "getAssetPrice" | "ownerOf" | "tokenURI" | "uri" | "simulateSwap" | "latestRoundData" | "getAccountLiquidity" | "markets" | "borrowBalanceCurrent" | "collateralBalanceOf" | "isBorrowCollateralized" | "userBasic" | "borrowBalanceOf" | "getAssetInfoByAddress" | "getPrice" | "get_best_rate" | "get_exchange_amount" | "calc_token_amount" | "get_dy" | "locked" | "mulAndDiv" | "read_bytes" | "read_bytes32" | "read_fct_bytes" | "read_fct_bytes32" | "read_fct_uint256" | "read_uint256" | "equalBytes32" | "positions" | "protocolFees" | "slot0" | "ticks" | "getEthBalance";
    input: {
        to: string | Variable;
        value: string | Variable | undefined;
        methodParams: {};
    };
}>;

declare function getCalldataForActuator({ signedFCT, purgedFCT, investor, activator, version, }: {
    signedFCT: IBatchMultiSigCallFCT;
    purgedFCT: string;
    investor: string;
    activator: string;
    version: string;
}): string;

declare const getAuthenticatorSignature: (typedData: BatchMultiSigCallTypedData) => ethers.Signature | {
    r: string;
    s: string;
    v: number;
};

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
    _variables: Variables;
    protected _options: Options;
    protected _calls: FCTCalls;
    constructor(input?: BatchMultiSigCallConstructor);
    get options(): RequiredFCTOptions;
    get calls(): StrictMSCallInput[];
    get decodedCalls(): DecodedCalls[];
    get computed(): IComputed[];
    get computedWithValues(): ComputedVariable[];
    setOptions: (options: DeepPartial<IFCTOptions>) => IFCTOptions;
    setCallDefaults: (callDefault: DeepPartial<ICallDefaults>) => ICallDefaults;
    changeChainId: (chainId: ChainId) => void;
    addComputed: (computed: IComputed) => {
        type: "computed";
        id: string;
    } & {
        type: "computed";
    };
    getPlugin: typeof getPlugin;
    getPluginClass: typeof getPluginClass;
    getPluginData: typeof getPluginData;
    createPlugin: typeof createPlugin;
    create: typeof create;
    createMultiple: typeof createMultiple;
    exportFCT: typeof exportFCT;
    importFCT: typeof importFCT;
    importEncodedFCT: typeof importEncodedFCT;
    getCall: typeof getCall;
    static utils: typeof utils;
    static from: (input: IBatchMultiSigCallFCT) => BatchMultiSigCall;
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

type index_BatchMultiSigCall = BatchMultiSigCall;
declare const index_BatchMultiSigCall: typeof BatchMultiSigCall;
declare const index_DEFAULT_CALL_OPTIONS: typeof DEFAULT_CALL_OPTIONS;
declare const index_EIP712_MULTISIG: typeof EIP712_MULTISIG;
declare const index_EIP712_RECURRENCY: typeof EIP712_RECURRENCY;
declare const index_NO_JUMP: typeof NO_JUMP;
declare const index_addresses: typeof addresses;
declare const index_utils: typeof utils;
declare namespace index {
  export {
    index_BatchMultiSigCall as BatchMultiSigCall,
    index_DEFAULT_CALL_OPTIONS as DEFAULT_CALL_OPTIONS,
    index_EIP712_MULTISIG as EIP712_MULTISIG,
    index_EIP712_RECURRENCY as EIP712_RECURRENCY,
    index_NO_JUMP as NO_JUMP,
    index_addresses as addresses,
    index_utils as utils,
  };
}

export { BatchMultiSigCall, BatchMultiSigCallConstructor, BatchMultiSigCallTypedData, CallOptions, CallType, ComputedVariable, DecodedCalls, DeepPartial, DeepRequired, EIP1559GasPrice, index as FCTBatchMultiSigCall, FCTCall, FCTCallParam, IBatchMultiSigCallFCT, ICallDefaults, IComputed, IFCTOptions, IMSCallInput, IMSCallInputWithNodeId, IMSCallWithEncodedData, IPluginCall, IRequiredApproval, ITxValidator, IWithPlugin, MSCall, MSCallMandatory, MandatoryTypedDataMessage, MessageComputed, MessageLimits, MessageMeta, MessageMultiSig, MessageRecurrency, MessageTransaction, MethodParamsInterface, OptionalTypedDataMessage, Param, ParamWithoutVariable, PartialBatchMultiSigCall, RequiredFCTOptions, RequiredKeys, StrictMSCallInput, TypedDataDomain, TypedDataLimits, TypedDataMessage, TypedDataMessageTransaction, TypedDataMeta, TypedDataMultiSig, TypedDataRecurrency, TypedDataTypes, Variable, index$3 as constants, index$1 as utils, index$2 as variables };
