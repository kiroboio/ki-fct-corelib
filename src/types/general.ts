import { CALL_TYPE, Flow } from "../constants";
import { GlobalVariable } from "../variables";

export type Variable =
  | { type: "output"; id: { nodeId: string; innerIndex: number } }
  | { type: "external"; id: number }
  | { type: "global"; id: GlobalVariable }
  | { type: "computed"; id: string }
  | { type: "validation"; id: string };

export type ParamValue = boolean | string | string[] | boolean[] | Param[] | Param[][] | Variable | ParamValue[];

export interface Param {
  name: string;
  type: string;
  value?: ParamValue;
  customType?: boolean;
  hashed?: boolean;
}

export type ParamWithoutVariable<P extends Param> = P & { value?: boolean | string | string[] | Param[] | Param[][] };

export interface MethodParamsInterface {
  method: string;
  params: Param[];
  to?: string | Variable;
}

export type CallType = keyof typeof CALL_TYPE;
export interface CallOptions {
  permissions?: string;
  gasLimit?: string;
  flow?: Flow;
  jumpOnSuccess?: string;
  jumpOnFail?: string;
  falseMeansFail?: boolean;
  callType?: CallType;
  validation?: string;
  payerIndex?: number;
}

export interface IPluginCall {
  value?: string | Variable;
  to: string | Variable;
  method: string;
  params: Param[];
  options?: CallOptions;
}
