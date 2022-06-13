export interface BatchFlags {
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
  flow?: boolean;
}

export interface MultiCallFlags {
  viewOnly: boolean;
  continueOnFail: boolean;
  stopOnFail: boolean;
  stopOnSuccess: boolean;
  revertOnSuccess: boolean;
}

export interface CallInput {
  value: string;
  to: string;
  data: string;
  signer: string;
  gasLimit?: number;
  flags?: MultiCallFlags;
}

export interface BatchMultiSigCallPackedInput {
  groupId: number;
  nonce: number;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: BatchFlags;
  multiCalls: CallInput[];
}

export interface Signature {
  r: string;
  s: string;
  v: string;
}

export interface PackedMSCall {
  value: string;
  signer: string;
  gasLimit: number;
  flags: string;
  to: string;
  method?: string;
  params?: string;
  encodedTx: string;
}

export interface BatchMultiSigCallPackedData {
  sessionId: string;
  encodedLimits: string;
  encodedData: string;
  unhashedCall: BatchMultiSigCallPackedInput;
  mcall: PackedMSCall[];
}
