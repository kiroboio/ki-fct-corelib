import { MessageTypeProperty } from "@metamask/eth-sig-util";

import { CALL_TYPE_MSG } from "../../constants";
import { ComputedVariable, FCTCallParam } from "./general";

export interface TypedDataRecurrency {
  max_repeats: string;
  chill_time: string;
  accumetable: boolean;
}

export interface TypedDataMultiSig {
  signers: string[];
  required_signers: number;
}

export type TypedDataTypes = {
  EIP712Domain: MessageTypeProperty[];
  BatchMultiSigCall: MessageTypeProperty[];
  Meta: MessageTypeProperty[];
  Limits: MessageTypeProperty[];
  Call: MessageTypeProperty[];
  Recurrency?: MessageTypeProperty[];
  MultiSig?: MessageTypeProperty[];
  Computed?: MessageTypeProperty[];
} & { [key: string]: MessageTypeProperty[] };

export interface TypedDataDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
  salt: string;
}

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
  [key: string]: FCTCallParam;
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
  auth_enabled: boolean;
}

export type MessageTransaction = Record<`transaction_${number}`, TypedDataMessageTransaction>;
export type MessageMeta = Record<"meta", TypedDataMeta>;
export type MessageLimits = Record<"limits", TypedDataLimits>;
export type MessageRecurrency = Record<"recurrency", TypedDataRecurrency>;
export type MessageMultiSig = Record<"multisig", TypedDataMultiSig>;
export type MessageComputed = Record<`computed_${number}`, Omit<ComputedVariable, "index">>;

export type MandatoryTypedDataMessage = MessageTransaction & MessageMeta & MessageLimits;
export type OptionalTypedDataMessage = MessageRecurrency & MessageMultiSig & MessageComputed;

export type TypedDataMessage = MandatoryTypedDataMessage & Partial<OptionalTypedDataMessage>;

export interface BatchMultiSigCallTypedData {
  types: TypedDataTypes;
  primaryType: string;
  domain: TypedDataDomain;
  message: TypedDataMessage;
}
