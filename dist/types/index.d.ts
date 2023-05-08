import { JsonFragment } from '@ethersproject/abi';
import { SignatureLike } from '@ethersproject/bytes';
import { ChainId } from '@kiroboio/fct-plugins';
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

export { BatchMultiSigCallConstructor, BatchMultiSigCallTypedData, CallOptions, CallType, ComputedVariable, DecodedCalls, DeepPartial, DeepRequired, EIP1559GasPrice, FCTCall, FCTCallParam, IBatchMultiSigCallFCT, ICallDefaults, IComputed, IFCTOptions, IMSCallInput, IMSCallInputWithNodeId, IMSCallWithEncodedData, IPluginCall, IRequiredApproval, ITxValidator, IWithPlugin, MSCall, MSCallMandatory, MandatoryTypedDataMessage, MessageComputed, MessageLimits, MessageMeta, MessageMultiSig, MessageRecurrency, MessageTransaction, MethodParamsInterface, OptionalTypedDataMessage, Param, ParamWithoutVariable, PartialBatchMultiSigCall, RequiredFCTOptions, RequiredKeys, StrictMSCallInput, TypedDataDomain, TypedDataLimits, TypedDataMessage, TypedDataMessageTransaction, TypedDataMeta, TypedDataMultiSig, TypedDataRecurrency, TypedDataTypes, Variable };
