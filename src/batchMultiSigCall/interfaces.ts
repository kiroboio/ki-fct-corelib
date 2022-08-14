import { Flow } from "../constants";
import { BatchCallBase, MultiCallBase, Validator } from "../interfaces";

export interface MSCallInput extends Omit<MultiCallBase, "flags"> {
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

export interface BatchMSCallInput extends BatchCallBase {
  calls: MSCallInput[];
}

export interface MSCall {
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

export interface BatchMSCall {
  typeHash: string;
  sessionId: string;
  typedData: object;
  encodedMessage: string;
  encodedLimits: string;
  inputData: BatchMSCallInput;
  mcall: MSCall[];
  addCall: (tx: MSCallInput, index?: number) => Promise<BatchMSCall>;
  replaceCall: (tx: MSCallInput, index: number) => Promise<BatchMSCall>;
  removeCall: (index: number) => Promise<BatchMSCall>;
  getCall: (index: number) => BatchMSCall;
  get length(): number;
}
