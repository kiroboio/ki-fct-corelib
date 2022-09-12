import { Flow } from "./constants";

export interface Params {
  name: string;
  type: string;
  value?: boolean | string | string[] | Params[] | Params[][];
  customType?: boolean;
  variable?: string;
}

export interface DecodeTx {
  encodedMessage: string;
  encodedDetails: string;
  params?: Params[];
}

export interface BatchFlags {
  viewOnly: boolean;
  cancelable: boolean;
  payment: boolean;
  eip712: boolean;
  flow: boolean;
}

// For multiCalls in batchMultiCalls
export interface MultiCallFlags {
  viewOnly: boolean;
  onFailStop: boolean;
  onFailContinue: boolean;
  onSuccessStop: boolean;
  onSuccessRevert: boolean;
}

export interface MethodParamsInterface {
  method: string;
  params: Params[];
  validator?: Validator;
  to?: string;
}

export interface ContractInteractionInterface {
  name: string;
  type: string;
}

export interface BatchCallBase {
  groupId: number;
  nonce: number;

  afterTimestamp?: number;
  beforeTimestamp?: number;
  gasLimit?: number;
  maxGasPrice?: number;
  flags?: Partial<BatchFlags>;
}

export interface CallOptions {
  gasLimit?: string;
  flow?: Flow;
  jumpOnSuccess?: number;
  jumpOnFail?: number;
}

export interface MultiCallBase {
  method?: string;
  params?: Params[];

  gasLimit?: number;
  flags?: Partial<MultiCallFlags>;
}

export interface Validator {
  method: string;
  params: {
    [key: string]: string;
  };
  validatorAddress: string;
}

export interface IPlugin {
  create: () => Promise<IPluginCall>;
}

export interface IPluginCall {
  value?: string;
  to: string;
  method: string;
  params: Params[];
  viewOnly?: boolean;
}
