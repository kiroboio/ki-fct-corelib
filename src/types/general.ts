import { CALL_TYPE, Flow } from "constants/index";
import { GlobalVariable } from "variables/index";

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

export interface MethodParamsInterface {
  method: string;
  params: Param[];
  validator?: Validator;
  to?: string | Variable;
}

export type CallType = keyof typeof CALL_TYPE;
export interface CallOptions {
  gasLimit?: string;
  flow?: Flow;
  jumpOnSuccess?: string;
  jumpOnFail?: string;
  falseMeansFail?: boolean;
  callType?: CallType;
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
