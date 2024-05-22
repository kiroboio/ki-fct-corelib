import { MessageTypeProperty } from "@metamask/eth-sig-util";

import { CALL_TYPE_MSG } from "../../constants";
import { IValidationEIP712 } from "../classes/Validation/types";
import { IComputedEIP712 } from "../classes/Variables/types";
import { FCTCallParam } from "./general";

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

export interface TypedDataLimits {
  valid_from: string;
  expires_at: string;
  payable_gas_limit_in_kilo: string;
  max_payable_gas_price: string;
  purgeable: boolean;
  blockable: boolean;
}

export interface TypedDataMeta {
  name: string;
  app: string;
  app_version: string;
  builder: string;
  builder_address: string;
  domain: string;
}

export interface TypedDataEngine {
  selector: string;
  version: string;
  random_id: string;
  eip712: boolean;
  verifier: string;
  auth_enabled: boolean;
  dry_run: boolean;
}

export type MessageTransaction = Record<`transaction_${number}`, TypedDataMessageTransaction>;
export type MessageMeta = Record<"meta", TypedDataMeta>;
export type MessageEngine = Record<"engine", TypedDataEngine>;
export type MessageLimits = Record<"limits", TypedDataLimits>;
export type MessageRecurrency = Record<"recurrency", TypedDataRecurrency>;
export type MessageMultiSig = Record<"multisig", TypedDataMultiSig>;
export type MessageComputed = Record<`computed_${number}`, IComputedEIP712>;
export type MessageValidation = Record<`validation_${number}`, IValidationEIP712>;

export type MandatoryTypedDataMessage = MessageTransaction & MessageMeta & MessageEngine & MessageLimits;
export type OptionalTypedDataMessage = MessageRecurrency & MessageMultiSig & MessageComputed;

export type TypedDataMessage = MandatoryTypedDataMessage & Partial<OptionalTypedDataMessage>;

export interface BatchMultiSigCallTypedData {
  types: TypedDataTypes;
  primaryType: string;
  domain: TypedDataDomain;
  message: TypedDataMessage;
}
