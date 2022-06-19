import { BatchCallBase, MultiCallBase } from "../interfaces";

export interface MultiCallInputInterface extends MultiCallBase {
  value: string;
  to: string;
}

export interface BatchMultiCallPackedInputInterface extends BatchCallBase {
  signer: string;
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
  encodedMessage: string;
  sessionId: string;
  signer: string;
  unhashedCall: BatchMultiCallPackedInputInterface;
  mcall: MultiCallPacked[];
}
