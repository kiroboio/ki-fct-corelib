export interface TransferFlags {
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
  flow?: boolean;
}
export interface MultiCallInput {
  value: string;
  to: string;
  data: string;
  gasLimit?: number;
  onFailStop?: boolean;
  onFailContinue?: boolean;
  onSuccessStop?: boolean;
  onSuccessRevert?: boolean;
}

export interface MultiCallPackedInput {
  groupId: number;
  nonce: number;
  signer: string;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: TransferFlags;
  mcall: MultiCallInput[];
}

export interface MultiCall {
  value: string;
  to: string;
  gasLimit: number;
  flags: string;
  data: string;
}

export interface MultiCallPacked {
  encodedData: string;
  sessionId: string;
  signer: string;
  unhashedCall: MultiCallPackedInput;

  mcall: MultiCall[];
}
