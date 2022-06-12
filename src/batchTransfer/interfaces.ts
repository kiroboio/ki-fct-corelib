export interface TransferFlags {
  eip712?: boolean;
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
}
export interface TransferCall {
  token: string;
  tokenEnsHash?: string;
  to: string;
  toEnsHash?: string;
  groupId: number;
  nonce: number;
  value: number;
  signer: string;

  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: TransferFlags;
}

export interface Transfer {
  token: string;
  tokenEnsHash: string;
  to: string;
  toEnsHash: string;
  value: number;
  signer: string;
  sessionId: string;
  typedData: object;
  hashedData: string;
  unhashedCall: TransferCall;
}
