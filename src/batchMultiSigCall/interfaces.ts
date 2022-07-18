import { BatchCallBase, MultiCallBase, Validator } from "../interfaces";

export interface MultiSigCallInputInterface extends MultiCallBase {
  value: string;
  to: string;
  toEnsHash?: string;
  signer: string;
  signerVariableId?: string;
  validator?: Validator;
}

export interface BatchMultiSigCallInputInterface extends BatchCallBase {
  calls: MultiSigCallInputInterface[];
}

export interface MultiSigCall {
  typeHash: string;
  functionSignature: string;
  value: string;
  signer: string;
  gasLimit: number;
  flags: string;
  to: string;
  ensHash?: string;
  data: string;
  encodedMessage: string;
  encodedDetails: string;
}

export interface BatchMultiSigCallInterface {
  typeHash: string;
  sessionId: string;
  typedData: object;
  encodedMessage: string;
  encodedLimits: string;
  inputData: BatchMultiSigCallInputInterface;
  mcall: MultiSigCall[];
}
