export interface TransferFlags {
  staticCall?: boolean;
  cancelable?: boolean;
  payment?: boolean;
}
export interface TransferCall {
  token: string;
  to: string;
  value: number;
  signer: string;
  groupId: number;
  nonce: number;
  afterTimestamp?: number;
  beforeTimestamp?: number;
  maxGas?: number;
  maxGasPrice?: number;
  flags?: TransferFlags;
}

export interface Transfer {
  signer: string;
  token: string;
  to: string;
  value: number;
  sessionId: string;
  hashedData: string;
  unhashedCall: TransferCall;
}
