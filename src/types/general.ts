import { CALL_TYPE, Flow } from "../constants";
import { GlobalVariable } from "../variables";

export type Variable =
  | { type: "output"; id: { nodeId: string; innerIndex: number } }
  | { type: "external"; id: number }
  | { type: "global"; id: GlobalVariable }
  | { type: "computed"; id: string }
  | { type: "validation"; id: string };

// export type ParamValue = boolean | string | string[] | boolean[] | Param[] | Param[][] | Variable | ParamValue[];
export type ParamValue = boolean | string | (string | Variable | undefined)[] | Param[] | Param[][] | Variable;

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
  /** Gas limit of the call */
  gasLimit?: string;
  /** Behaviour of the call */
  flow?: Flow;
  /** nodeId of the call to jump to on successful call. If undefined - go to next call */
  jumpOnSuccess?: string;
  /** nodeId of the call to jump to on failed call. If undefined - go to next call */
  jumpOnFail?: string;
  /** If a call returns "false", it will be considered as failed */
  falseMeansFail?: boolean;
  callType?: CallType;
  validation?: string;
  /** Index of the call of who is going to pay for the gas.
   * 0 - executor.
   * undefined - who sends the call */
  payerIndex?: number;
  /** True if not to include types in method interface.
   * For example, "magic()" will be "magic", "transfer(address,uint256)" will be "transfer" */
  usePureMethod?: boolean;
}

export interface IPluginCall {
  value?: string | Variable;
  to: string | Variable;
  method: string;
  params: Param[];
  options?: CallOptions;
}
