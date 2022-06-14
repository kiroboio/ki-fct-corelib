import { BatchCallBase, MultiCallBase } from "../interfaces";

export interface MultiSigCallInputInterface extends MultiCallBase {
  value: string;
  to: string;
  toEnsHash?: string;
  signer: string;
}

export interface BatchMultiSigCallInputInterface extends BatchCallBase {
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
