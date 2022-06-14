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
  encodedTx: string;
}

export interface BatchMultiSigCallPackedInterface {
  sessionId: string;
  encodedLimits: string;
  encodedData: string;
  unhashedCall: BatchMultiSigCallPackedInputInterface;
  mcall: MultiSigCallPacked[];
}
