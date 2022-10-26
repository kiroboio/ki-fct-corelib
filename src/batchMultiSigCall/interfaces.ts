import { MessageTypeProperty } from "@metamask/eth-sig-util";
import { CallOptions, IPlugin, Params, Validator, Variable } from "../interfaces";

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

export interface TypedDataMessageTransaction {
  call: {
    call_index: number;
    payer_index: number;
    from: string;
    to: string;
    to_ens: string;
    eth_value: string;
    gas_limit: string;
    view_only: boolean;
    permissions: number;
    flow_control: string;
    jump_on_success: number;
    jump_on_fail: number;
    method_interface: string;
  };
}

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

export interface BatchMultiSigCallTypedData {
  types: TypedDataTypes;
  primaryType: string;
  domain: TypedDataDomain;
  message: TypedDataMessageOptions | Record<string, TypedDataMessageTransaction>;
}

export interface IBatchMultiSigCallFCT {
  typeHash: string;
  typedData: BatchMultiSigCallTypedData;
  sessionId: string;
  nameHash: string;
  mcall: MSCall[];
  builder: string;
}

export interface IMSCallInput {
  nodeId: string;
  value?: string | Variable;
  to: string | Variable;
  from: string | Variable;
  params?: Params[];
  method?: string;
  toENS?: string;
  validator?: Validator;
  viewOnly?: boolean;
  options?: CallOptions;
}

export interface MSCall {
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

export interface MSCallOptions {
  name?: string;
  validFrom: string;
  expiresAt: string;
  maxGasPrice: string;
  blockable: boolean;
  purgeable: boolean;
  builder: string;

  recurrency?: {
    maxRepeats?: string;
    chillTime?: string;
    accumetable?: boolean;
  };
  multisig?: {
    externalSigners?: string[];
    minimumApprovals?: number;
  };
}

export interface IWithPlugin {
  nodeId: string;
  plugin: IPlugin;
  from: string;
  options?: CallOptions;
}

export interface IInput {
  get(): unknown;
  set(params: Record<string, any>): boolean;
}

export interface IOutput {
  get(): unknown;
}
