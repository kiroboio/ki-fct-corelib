import { BatchCallBase } from "../interfaces";

export interface TransferInputInterface extends BatchCallBase {
  token: string;
  tokenEnsHash?: string;
  to: string;
  toEnsHash?: string;
  groupId: number;
  nonce: number;
  value: number;
  signer: string;
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
