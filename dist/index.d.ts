import * as _kiroboio_fct_plugins from '@kiroboio/fct-plugins';
import { AllPlugins, PluginInstance, getPlugin as getPlugin$1, ChainId } from '@kiroboio/fct-plugins';
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
    readonly "greater than": string;
    readonly "greater equal than": string;
    readonly or: string;
    readonly and: string;
    readonly "and not": string;
    readonly "not equal": string;
};
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

interface ValidationVariable {
    type: "validation";
    id: string;
}
interface IValidation {
    id?: string;
    value1: string | Variable | ValidationVariable;
    operator: keyof typeof ValidationOperator;
    value2: string | Variable | ValidationVariable;
}
interface IValidationData {
    value1: string;
    operator: string;
    value2: string;
}
interface IValidationEIP712 {
    index: string;
    value_1: string;
    op: string;
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
    values: [string, string, string, string];
    operators: [string, string, string];
}

interface ICall {
    get get(): StrictMSCallInput;
    get options(): DeepRequired<CallOptions>;
    get getDecoded(): DecodedCalls;
    getAsMCall(typedData: BatchMultiSigCallTypedData, index: number): MSCall;
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
    generateEIP712Message(index: number): TypedDataMessageTransaction;
    getTypedHashes(): string[];
    getEncodedData(): string;
    getTypesArray(): number[];
    getFunctionSignature(): string;
    getFunction(): string;
}

interface IMulticall {
    target: string;
    callType: "action" | "view only";
    method: string;
    params: Param[];
}
interface IFCTMulticallConstructor {
    from: string | Variable;
    options?: Omit<CallOptions, "callType">;
    nodeId?: string;
    FCT: BatchMultiSigCall;
}
declare class Multicall implements ICall {
    protected FCT: BatchMultiSigCall;
    private _calls;
    private _from;
    private _nodeId;
    private _options;
    private _to;
    constructor(input: IFCTMulticallConstructor);
    get to(): string;
    get toENS(): string;
    get options(): DeepRequired<CallOptions>;
    get get(): {
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
            callType: "ACTION" | "VIEW_ONLY" | "LIBRARY";
            validation: string;
        };
        nodeId: string;
    };
    get getDecoded(): {
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
            callType: "ACTION" | "VIEW_ONLY" | "LIBRARY";
            validation: string;
        };
        nodeId: string;
    };
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
    add: (call: IMulticall) => IMulticall[];
    setFrom: (from: string | Variable) => string | Variable;
    setOptions: (options: Omit<CallOptions, "callType">) => CallOptions;
    setNodeId: (nodeId: string) => string;
    private decodeParams;
    private getUsedStructTypes;
    private getStructType;
    private getParamsEIP712;
    private getJumps;
}

type PluginParams<T extends AllPlugins> = ConstructorParameters<T>[0]["initParams"];

declare function create<F extends FCTInputCall>(this: BatchMultiSigCall, call: F): Promise<Call | (F & Multicall)>;
declare function createMultiple(this: BatchMultiSigCall, calls: FCTInputCall[]): Promise<FCTCall[]>;
declare function createPlugin<T extends AllPlugins>(this: BatchMultiSigCall, { plugin, initParams, }: {
    plugin: T;
    initParams?: PluginParams<T>;
}): _kiroboio_fct_plugins.NewPluginType<"ERC20", "GETTER", "name", string, {
    input: {
        to: _kiroboio_fct_plugins.FctAddress;
        methodParams: {};
    };
    output: {
        name: _kiroboio_fct_plugins.FctString;
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
        id: "gasPrice" | "blockNumber" | "blockTimestamp" | "minerAddress" | "originAddress" | "investorAddress" | "activatorAddress" | "engineAddress";
    } | {
        type: "computed";
        id: string;
    }) | undefined;
    methodParams: Partial<{}>;
}>>;
declare function getCall(this: BatchMultiSigCall, index: number): FCTCall;
declare function getCallByNodeId(this: BatchMultiSigCall, nodeId: string): FCTCall;
declare function exportFCT(this: BatchMultiSigCall): IFCT;
declare function importFCT<FCT extends IFCT>(this: BatchMultiSigCall, fct: FCT): StrictMSCallInput[];
declare function importEncodedFCT(this: BatchMultiSigCall, calldata: string): Promise<StrictMSCallInput[]>;

declare function getPlugin(this: BatchMultiSigCall, index: number): Promise<PluginInstance>;
declare function getPluginClass(this: BatchMultiSigCall, index: number): Promise<ReturnType<typeof getPlugin$1>>;
declare function getPluginData(this: BatchMultiSigCall, index: number): Promise<{
    protocol: "SUSHISWAP" | "UNISWAP" | "ERC20" | "ERC721" | "ERC1155" | "TOKEN_MATH" | "TOKEN_VALIDATOR" | "UTILITY" | "PARASWAP" | "COMPOUND_V2" | "COMPOUND_V3" | "1INCH" | "CURVE" | "CHAINLINK" | "UNISWAP_V3" | "SECURE_STORAGE" | "RADIANTV2" | "AaveV3";
    type: "ACTION" | "LIBRARY" | "GETTER" | "VALIDATOR" | "CALCULATOR" | "ORACLE";
    method: "" | "symbol" | "equal" | "name" | "approve" | "totalSupply" | "decimals" | "balanceOf" | "allowance" | "supportsInterface" | "add" | "sub" | "mul" | "div" | "mod" | "getAmountsOut" | "deposit" | "borrow" | "getUserAccountData" | "simpleSwap" | "swap" | "addLiquidityETH" | "removeLiquidityETH" | "safeTransferFrom" | "setApprovalForAll" | "withdraw" | "repay" | "supply" | "swapBorrowRateMode" | "getAmountsIn" | "isApprovedForAll" | "getReserveData" | "getUserReserveData" | "getReserveConfigurationData" | "getReserveTokensAddresses" | "getAssetPrice" | "lessThan" | "between" | "greaterThan" | "FLASHLOAN_PREMIUM_TOTAL" | "FLASHLOAN_PREMIUM_TO_PROTOCOL" | "add_liquidity" | "remove_liquidity" | "swapExactTokensForTokens" | "swapExactETHForTokens" | "swapExactTokensForETH" | "swapTokensForExactTokens" | "swapTokensForExactETH" | "swapETHForExactTokens" | "simpleRemoveLiquidity" | "exactInput" | "exactInputSingle" | "exactOutput" | "exactOutputSingle" | "mint" | "burn" | "increaseLiquidity" | "decreaseLiquidity" | "collect" | "uniswapV3SwapTo" | "uniswapV3Swap" | "uniswapV3SwapToWithPermit" | "unoswap" | "buyOnUniswapV2Fork" | "megaSwap" | "multiSwap" | "simpleBuy" | "swapOnUniswapV2Fork" | "exchange" | "swapOnZeroXv4" | "safeBatchTransferFrom" | "swapTo_noSlippageProtection" | "swap_noSlippageProtection" | "addLiquidity_noMinProtection" | "addLiquidityTo_noMinProtection" | "redeem" | "repayBorrow" | "enterMarkets" | "exitMarket" | "claimComp" | "supplyFrom" | "supplyTo" | "withdrawFrom" | "withdrawTo" | "exchange_with_best_rate" | "remove_liquidity_one_coin" | "create_lock" | "increase_amount" | "increase_unlock_time" | "write_bytes" | "write_bytes32" | "write_fct_bytes" | "write_fct_bytes32" | "write_fct_uint256" | "write_uint256" | "liquidationCall" | "mintToTreasury" | "rebalanceStableBorrowRate" | "repayWithATokens" | "setUserEMode" | "setUserUseReserveAsCollateral" | "getReserves" | "positions" | "protocolFees" | "slot0" | "ticks" | "getApproved" | "ownerOf" | "tokenURI" | "uri" | "simulateSwap" | "latestRoundData" | "getAccountLiquidity" | "markets" | "borrowBalanceCurrent" | "collateralBalanceOf" | "isBorrowCollateralized" | "userBasic" | "borrowBalanceOf" | "getAssetInfoByAddress" | "getPrice" | "get_best_rate" | "get_exchange_amount" | "calc_token_amount" | "get_dy" | "locked" | "read_bytes" | "read_bytes32" | "read_fct_bytes" | "read_fct_bytes32" | "read_fct_uint256" | "read_uint256" | "mulAndDiv" | "betweenEqual" | "equalAddress" | "equalBytes32" | "greaterEqual" | "lessEqual" | "getEthBalance" | "getEModeCategoryData" | "getReserveNormalizedIncome" | "getReserveNormalizedVariableDebt" | "getUserEMode" | ("transferFrom" | "transfer");
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
    get calls(): StrictMSCallInput[];
    get pureCalls(): FCTCall[];
    get decodedCalls(): DecodedCalls[];
    get callDefault(): ICallDefaults;
    get computed(): IComputed[];
    get computedAsData(): IComputedData[];
    get validations(): Required<IValidation>[];
    setOptions<O extends DeepPartial<IFCTOptions>>(options: O): IFCTOptions & O;
    setCallDefaults<C extends DeepPartial<ICallDefaults>>(callDefault: C): Omit<RequiredKeys<Partial<MSCallMandatory>, "value">, "nodeId"> & {
        options: {
            permissions: string;
            gasLimit: string;
            flow: Flow;
            jumpOnSuccess: string;
            jumpOnFail: string;
            falseMeansFail: boolean;
            callType: "ACTION" | "VIEW_ONLY" | "LIBRARY";
            validation: string;
        };
    } & C;
    changeChainId: (chainId: ChainId) => void;
    addComputed: (computed: Partial<IComputed>) => {
        type: "computed";
        id: string;
    } & {
        type: "computed";
    };
    getPlugin: typeof getPlugin;
    getPluginClass: typeof getPluginClass;
    getPluginData: typeof getPluginData;
    createPlugin: typeof createPlugin;
    add: typeof create;
    addMultiple: typeof createMultiple;
    create: typeof create;
    createMultiple: typeof createMultiple;
    exportFCT: typeof exportFCT;
    importFCT: typeof importFCT;
    importEncodedFCT: typeof importEncodedFCT;
    getCall: typeof getCall;
    getCallByNodeId: typeof getCallByNodeId;
    static utils: typeof utils;
    static from: (input: IFCT & {
        validations?: [
        ];
    }) => BatchMultiSigCall;
}

declare class CallBase {
    protected _call: IMSCallInput & {
        nodeId: string;
    };
    constructor(input: IMSCallInput);
    get call(): IMSCallInput & {
        nodeId: string;
    };
    getOutputVariable(innerIndex?: number): Variable & {
        type: "output";
    };
    getTypesArray(): number[];
    getFunctionSignature(): string;
    getFunction(): string;
    setOptions(options: DeepPartial<CallOptions>): void;
    setCall(call: DeepPartial<IMSCallInput>): void;
}

declare class Call extends CallBase implements ICall {
    protected FCT: BatchMultiSigCall;
    constructor({ FCT, input }: {
        FCT: BatchMultiSigCall;
        input: IMSCallInput;
    });
    get get(): StrictMSCallInput;
    get options(): DeepRequired<CallOptions>;
    get getDecoded(): DecodedCalls;
    getAsMCall(typedData: BatchMultiSigCallTypedData, index: number): MSCall;
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
    generateEIP712Message(index: number): TypedDataMessageTransaction;
    getTypedHashes(): string[];
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
    protected _validations: Required<IValidation>[];
    constructor(FCT: BatchMultiSigCall);
    get get(): Required<IValidation>[];
    get getForEIP712(): IValidationEIP712[];
    get getForData(): IValidationData[];
    getIndex(id: string): number;
    add(validation: IValidation): ValidationVariable;
    addAndSetForCall({ nodeId, validation }: {
        nodeId: string;
        validation: IValidation;
    }): void;
    private handleVariable;
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
    addComputed(computed: Partial<IComputed>): Variable & {
        type: "computed";
    };
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
        call_type: (typeof CALL_TYPE_MSG)[keyof typeof CALL_TYPE_MSG];
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
type MessageComputed = Record<`computed_${number}`, IComputedData>;
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
interface IFCT {
    typeHash: string;
    typedData: BatchMultiSigCallTypedData;
    sessionId: string;
    nameHash: string;
    mcall: MSCall[];
    builder: string;
    variables: string[];
    externalSigners: string[];
    computed: Omit<IComputedData, "index">[];
    signatures: SignatureLike[];
    validations: IValidationData[];
}
type PartialBatchMultiSigCall = Pick<IFCT, "typedData" | "signatures" | "mcall">;
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
type FCTMCall = RequiredKeys<IMSCallInput, "nodeId">;
type StrictMSCallInput = RequiredKeys<IMSCallInput, "from" | "value" | "nodeId" | "options"> & {
    options: DeepRequired<CallOptions>;
};
interface DecodedCalls extends StrictMSCallInput {
    params?: ParamWithoutVariable<Param>[];
}
type IWithPlugin = {
    plugin: {
        create(): Promise<IPluginCall | undefined>;
    };
} & MSCallMandatory;
type IMSCallWithEncodedData = {
    nodeId?: string;
    abi: ReadonlyArray<ethers.utils.Fragment | JsonFragment> | string[];
    encodedData: string;
    to: string | Variable;
} & MSCallMandatory;
type FCTInputCall = IMSCallInput | IWithPlugin | IMSCallWithEncodedData | Multicall;
type FCTCall = Call | Multicall;
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
type ICallDefaults = Omit<RequiredKeys<Partial<MSCallMandatory>, "value">, "nodeId"> & {
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

type index$1_GlobalVariable = GlobalVariable;
declare const index$1_getActivatorAddress: typeof getActivatorAddress;
declare const index$1_getBlockNumber: typeof getBlockNumber;
declare const index$1_getBlockTimestamp: typeof getBlockTimestamp;
declare const index$1_getEngineAddress: typeof getEngineAddress;
declare const index$1_getGasPrice: typeof getGasPrice;
declare const index$1_getInvestorAddress: typeof getInvestorAddress;
declare const index$1_getMinerAddress: typeof getMinerAddress;
declare const index$1_getOriginAddress: typeof getOriginAddress;
declare const index$1_globalVariables: typeof globalVariables;
declare namespace index$1 {
  export {
    index$1_GlobalVariable as GlobalVariable,
    index$1_getActivatorAddress as getActivatorAddress,
    index$1_getBlockNumber as getBlockNumber,
    index$1_getBlockTimestamp as getBlockTimestamp,
    index$1_getEngineAddress as getEngineAddress,
    index$1_getGasPrice as getGasPrice,
    index$1_getInvestorAddress as getInvestorAddress,
    index$1_getMinerAddress as getMinerAddress,
    index$1_getOriginAddress as getOriginAddress,
    index$1_globalVariables as globalVariables,
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

export { BatchMultiSigCall, BatchMultiSigCallConstructor, BatchMultiSigCallTypedData, CallOptions, CallType, DecodedCalls, DeepPartial, DeepRequired, EIP1559GasPrice, FCTCall, FCTCallParam, FCTInputCall, FCTMCall, ICallDefaults, IFCT, IFCTOptions, IMSCallInput, IMSCallWithEncodedData, IPluginCall, IRequiredApproval, ITxValidator, IWithPlugin, MSCall, MSCallMandatory, MandatoryTypedDataMessage, MessageComputed, MessageLimits, MessageMeta, MessageMultiSig, MessageRecurrency, MessageTransaction, MethodParamsInterface, OptionalTypedDataMessage, Param, ParamWithoutVariable, PartialBatchMultiSigCall, RequiredFCTOptions, RequiredKeys, StrictMSCallInput, TypedDataDomain, TypedDataLimits, TypedDataMessage, TypedDataMessageTransaction, TypedDataMeta, TypedDataMultiSig, TypedDataRecurrency, TypedDataTypes, Variable, index$2 as constants, index as utils, index$1 as variables };
