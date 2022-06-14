import { MultiCallFlags, Params } from "../interfaces";

export interface DecodeTx {
  encodedData: string;
  encodedDetails: string;
  params?: Params[];
}

export interface BatchFlags {
  staticCall: boolean;
  cancelable: boolean;
  payment: boolean;
  flow: boolean;
}

export interface MultiCallInputInterface {
  value: string;
  to: string;

  data?: string;
  method?: string;
  params?: Params[];

  toEnsHash?: string;

  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;

  flags?: Partial<MultiCallFlags>;
}
export interface BatchMultiCallInputInterface {
  groupId: number;
  nonce: number;
  signer: string;

  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: Partial<BatchFlags>;

  calls: MultiCallInputInterface[];
}

export interface MultiCall {
  value: string;
  to: string;
  data: string;
  ensHash: string;
  typeHash: Uint8Array;
  flags: string;
  functionSignature: string;
  gasLimit: number;
}

export interface BatchMultiCallInterface {
  typeHash: Uint8Array;
  sessionId: string;
  signer: string;
  encodedMessage: string;
  encodedLimits: string;
  typedData: object;
  unhashedCall: BatchMultiCallInputInterface;
  mcall: MultiCall[];
}
