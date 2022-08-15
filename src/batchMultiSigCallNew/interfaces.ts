import { TypedData } from "ethers-eip712";
import { Flow } from "../constants";
import { BatchCallBase, BatchFlags, MultiCallBase, Validator } from "../interfaces";

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

export interface BatchMSCallInput {
  name?: string;
  validFrom?: number;
  expiresAt?: number;
  gasPriceLimit?: number;
  cancelable?: boolean;
  recurrency?: {
    maxRepeats: number;
    chillTime: number;
    accumetable: boolean;
  };
  multisig?: {
    externalSigners: string[];
    minimumApprovals: number;
  };
  flags?: {
    payment: boolean;
  };
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
}

export interface BatchMSCall {
  typeHash: string;
  sessionId: string;
  typedData: TypedData;
  inputData: BatchMSCallInput;
  mcall: MSCall[];
  addCall: (tx: MSCallInput, index?: number) => Promise<BatchMSCall | Error>;
  replaceCall: (tx: MSCallInput, index: number) => Promise<MSCall | Error>;
  removeCall: (index: number) => Promise<MSCall | Error>;
  getCall: (index: number) => MSCall;
  get length(): number;
}
