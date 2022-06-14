export interface BatchFlags {
  staticCall: boolean;
  cancelable: boolean;
  payment: boolean;
  flow: boolean;
}

export interface MultiCallFlags {
  onFailStop: boolean;
  onFailContinue: boolean;
  onSuccessStop: boolean;
  onSuccessRevert: boolean;
}
export interface MultiCallInputInterface {
  value: string;
  to: string;
  data: string;
  gasLimit?: number;
  flags?: Partial<MultiCallFlags>;
}

export interface BatchMultiCallPackedInputInterface {
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

export interface MultiCallPacked {
  value: string;
  to: string;
  gasLimit: number;
  flags: string;
  data: string;
}

export interface BatchMultiCallPackedInterface {
  encodedData: string;
  sessionId: string;
  signer: string;
  unhashedCall: BatchMultiCallPackedInputInterface;
  mcall: MultiCallPacked[];
}
