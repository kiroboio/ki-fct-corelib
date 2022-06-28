import { BatchCallBase, MultiCallBase } from "../interfaces";

export interface MultiCallInputInterface extends MultiCallBase {
  value: string;
  toEnsHash?: string;
  to: string;
}
export interface BatchMultiCallInputInterface extends BatchCallBase {
  signer: string;
  calls: MultiCallInputInterface[];
}

export interface MultiCall {
  value: string;
  to: string;
  data: string;
  ensHash: string;
  typeHash: string;
  flags: string;
  functionSignature: string;
  gasLimit: number;
  encodedMessage: string;
  encodedDetails: string;
}

export interface BatchMultiCallInterface {
  typeHash: string;
  sessionId: string;
  signer: string;
  encodedMessage: string;
  encodedLimits: string;
  typedData: object;
  inputData: BatchMultiCallInputInterface;
  mcall: MultiCall[];
}
