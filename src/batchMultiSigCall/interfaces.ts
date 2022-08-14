import { Flow } from "../constants";
import { BatchCallBase, MultiCallBase, Validator } from "../interfaces";

export interface MultiSigCallInputInterface extends Omit<MultiCallBase, "flags"> {
  value: string;
  to: string;
  toEnsHash?: string;
  from: string;
  fromVariableId?: string;
  validator?: Validator;
  flow?: Flow;
  jump?: number;
  viewOnly?: boolean;
}

export interface BatchMultiSigCallInputInterface extends BatchCallBase {
  calls: MultiSigCallInputInterface[];
  addCall: (tx: BatchMultiSigCallInputInterface) => Promise<BatchMultiSigCallInputInterface>;
  replaceCall: (tx: BatchMultiSigCallInputInterface, index: number) => Promise<BatchMultiSigCallInputInterface>;
  removeCall: (index: number) => Promise<BatchMultiSigCallInputInterface>;
  getCall: (index: number) => BatchMultiSigCallInputInterface;
  get length(): number;
}

export interface MultiSigCallInterface {
  typeHash: string;
  functionSignature: string;
  value: string;
  from: string;
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
  mcall: MultiSigCallInterface[];
}
