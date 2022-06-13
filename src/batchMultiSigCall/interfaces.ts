import { Params } from "../interfaces";

export interface DecodeTx {
  encodedData: string;
  encodedDetails: string;
  params?: Params[];
}
export interface BatchFlags {
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
}
export interface MultiCallFlags {
  viewOnly: boolean;
  continueOnFail: boolean;
  stopOnFail: boolean;
  stopOnSuccess: boolean;
  revertOnSuccess: boolean;
}

export interface MultiSigCallInputData {
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

  flags?: MultiCallFlags;
}

export interface BatchMultiSigCallInputData {
  groupId: number;
  nonce: number;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: BatchFlags;
  multiCalls: MultiSigCallInputData[];
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

export interface BatchMultiSigCallData {
  typeHash: Uint8Array;
  sessionId: string;
  typedData: object;
  encodedMessage: string;
  encodedLimits: string;
  unhashedCall: BatchMultiSigCallInputData;
  mcall: MultiSigCall[];
}
