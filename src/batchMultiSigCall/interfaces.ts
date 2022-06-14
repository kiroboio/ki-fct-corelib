import { BatchFlags, MultiCallFlags, Params } from "../interfaces";

export interface DecodeTx {
  encodedData: string;
  encodedDetails: string;
  params?: Params[];
}

export interface MultiSigCallInputInterface {
  value: string;
  to: string;
  signer: string;

  method?: string;
  data?: string;
  params?: Params[];

  toEnsHash?: string;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;

  flags?: Partial<MultiCallFlags>;
}

export interface BatchMultiSigCallInputInterface {
  groupId: number;
  nonce: number;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: Partial<BatchFlags>;
  calls: MultiSigCallInputInterface[];
}

export interface MultiSigCall {
  typeHash: Uint8Array;
  functionSignature: string;
  value: string;
  signer: string;
  gasLimit: number;
  flags: string;
  to: string;
  ensHash?: string;
  data: string;
  encodedData: string;
  encodedDetails: string;
}

export interface BatchMultiSigCallInterface {
  typeHash: Uint8Array;
  sessionId: string;
  typedData: object;
  encodedMessage: string;
  encodedLimits: string;
  unhashedCall: BatchMultiSigCallInputInterface;
  mcall: MultiSigCall[];
}
