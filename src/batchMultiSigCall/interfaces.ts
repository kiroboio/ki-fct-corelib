import { CallOptions, IPlugin, Params, Validator } from "../interfaces";

export interface IBatchMultiSigCallFCT {
  typeHash: string;
  sessionId: string;
  nameHash: string;
  mcall: MSCall[];
}

export interface MSCallInput {
  value?: string;
  to: string;
  from: string;
  params?: Params[];
  method?: string;

  toENS?: string;
  validator?: Validator;

  viewOnly?: boolean;
  options?: CallOptions;
}

export interface MSCall {
  typeHash: string;
  ensHash: string;
  functionSignature: string;
  value: string;
  from: string;
  to: string;
  data: string;
  types: number[];
  typedHashes: string[];
}

export interface MSCallOptions {
  name?: string;
  validFrom?: number | string;
  expiresAt?: number | string;
  builder?: string;
  maxGasPrice?: number;
  cancelable?: boolean;
  purgeable?: boolean;
  recurrency?: {
    maxRepeats: number;
    chillTime: number;
    accumetable: boolean;
  };
  multisig?: {
    externalSigners: string[];
    minimumApprovals: number;
  };
}

export interface IWithPlugin {
  plugin: IPlugin;
  from: string;
  options?: CallOptions;
}

export interface IInput {
  get(): unknown;
  set(params: Record<string, any>): boolean;
}

export interface IOutput {
  get(): unknown;
}
