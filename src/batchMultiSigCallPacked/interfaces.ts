import { BatchCallBase, MultiCallBase } from "../interfaces";

export interface MultiSigCallPackedInputInterface extends MultiCallBase {
  value: string;
  to: string;
  signer: string;
}

export interface BatchMultiSigCallPackedInputInterface extends BatchCallBase {
  calls: MultiSigCallPackedInputInterface[];
}

export interface MultiSigCallPacked {
  value: string;
  signer: string;
  gasLimit: number;
  flags: string;
  to: string;
  method?: string;
  params?: string;
  encodedMessage: string;
}

export interface BatchMultiSigCallPackedInterface {
  sessionId: string;
  encodedLimits: string;
  encodedMessage: string;
  inputData: BatchMultiSigCallPackedInputInterface;
  mcall: MultiSigCallPacked[];
}
