import { GlobalVariable } from "variables";
import { Flow } from "./constants";

export type Variable =
  | { type: "output"; id: { nodeId: string; innerIndex: number } }
  | { type: "external"; id: number }
  | { type: "global"; id: GlobalVariable };

export interface Param {
  name: string;
  type: string;
  value?: boolean | string | string[] | Param[] | Param[][] | Variable;
  customType?: boolean;
}

export interface DecodeTx {
  encodedMessage: string;
  encodedDetails: string;
  params?: Param[];
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
  params: Param[];
  validator?: Validator;
  to?: string | Variable;
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
  jumpOnSuccess?: string;
  jumpOnFail?: string;
  falseMeansFail?: boolean;
}

export interface MultiCallBase {
  method?: string;
  params?: Param[];

  gasLimit?: number;
  flags?: Partial<MultiCallFlags>;
}

export interface Validator {
  method: string;
  params: {
    [key: string]: string | Variable;
  };
  validatorAddress: string;
}

export interface IPluginCall {
  value?: string;
  to: string;
  method: string;
  params: Param[];
  viewOnly?: boolean;
}
