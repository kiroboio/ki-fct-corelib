import { CALL_TYPE_MSG } from "@constants";
import { MessageTypeProperty } from "@metamask/eth-sig-util";
export interface IComputedVariable {
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
export interface TypedDataTypes {
    EIP712Domain: MessageTypeProperty[];
    BatchMultiSigCall: MessageTypeProperty[];
    Meta: MessageTypeProperty[];
    Limits: MessageTypeProperty[];
    Call: MessageTypeProperty[];
    Recurrency?: MessageTypeProperty[];
    MultiSig?: MessageTypeProperty[];
    [key: string]: MessageTypeProperty[];
}
export interface TypedDataDomain {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
}
export type TransactionParam = string | number | boolean | TransactionParam[] | {
    [key: string]: TransactionParam;
};
export type TypedDataMessageTransaction = {
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
    [key: string]: TransactionParam;
};
export interface TypedDataLimits {
    valid_from: string;
    expires_at: string;
    gas_price_limit: string;
    purgeable: boolean;
    blockable: boolean;
}
export interface TypedDataMeta {
    name: string;
    builder: string;
    selector: string;
    version: string;
    random_id: string;
    eip712: boolean;
}
export interface TypedDataMessageOptions {
    meta: TypedDataMeta;
    limits: TypedDataLimits;
    recurrency?: {
        max_repeats: string;
        chill_time: string;
        accumetable: boolean;
    };
    multisig?: {
        external_signers: string[];
        required_signatures: number;
    };
}
type MandatoryTypedDataMessage = Record<`transaction_${number}`, TypedDataMessageTransaction> & Record<"meta", TypedDataMeta> & Record<"limits", TypedDataLimits>;
type OptionalTypedDataMessage = Record<"recurrency", TypedDataRecurrency> & Record<"multisig", TypedDataMultiSig> & Record<`computed_${number}`, IComputedVariable>;
export type TypedDataMessage = MandatoryTypedDataMessage & Partial<OptionalTypedDataMessage>;
export interface BatchMultiSigCallTypedData {
    types: TypedDataTypes;
    primaryType: string;
    domain: TypedDataDomain;
    message: TypedDataMessage;
}
export {};
