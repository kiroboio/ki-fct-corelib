import { MultiCallFlags } from "../interfaces";

export interface TransferInputInterface {
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
  flags?: Partial<MultiCallFlags>;
}

export interface TransferInterface {
  token: string;
  tokenEnsHash: string;
  to: string;
  toEnsHash: string;
  value: number;
  signer: string;
  sessionId: string;
  typedData: object;
  hashedData: string;
  unhashedCall: TransferInputInterface;
}
