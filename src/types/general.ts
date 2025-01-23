import { CALL_TYPE, Flow } from "../constants";
import { GlobalVariable } from "../variables";
import { ConstantVariable } from "../variables/constantVariables";

export type PluginVariable = { name: "path"; type: "address[]"; value: (Variable & { type: "external" })[] };
export type CoreVariable =
  | { type: "output"; id: { nodeId: string; offset: number } | { nodeId: string; innerIndex: number } }
  | { type: "multicall_output"; id: { nodeId: string; offset: number } | { nodeId: string; innerIndex: number } }
  | { type: "external"; id: number }
  | { type: "global"; id: GlobalVariable }
  | { type: "computed"; id: string }
  | { type: "validation"; id: string }
  | { type: "constants"; id: ConstantVariable };

export type Variable = PluginVariable | CoreVariable;

export type ParamValue = boolean | string | (string | Variable | undefined)[] | Param[] | Param[][] | Variable;

export interface Param {
  name: string;
  type: string;
  value?: ParamValue;
  customType?: boolean;
  messageType?: string;
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
  /** Plugin data of gas limit of the call */
  pluginGasLimit?: string;
  /** Behaviour of the call */
  flow?: Flow;
  /** nodeId of the call to jump to on successful call. If undefined - go to next call */
  jumpOnSuccess?: string;
  /** nodeId of the call to jump to on failed call. If undefined - go to next call */
  jumpOnFail?: string;
  /** If a call returns "false", it will be considered as failed */
  falseMeansFail?: boolean;
  /** Call type - Action, View only, Library action, Library view only */
  callType?: CallType;
  /** Id of the validation call */
  validation?: string;
  /** Index of the call of who is going to pay for the gas.
   * 0 - executor.
   * undefined - who sends the call */
  payerIndex?: number;
  /** True if not to include types in method interface.
   * For example, "magic()" will be "magic", "transfer(address,uint256)" will be "transfer" */
  usePureMethod?: boolean;
  useMaxVarLength?: boolean;
}

export interface IPluginCall {
  value?: string | Variable;
  to: string | Variable;
  method: string;
  params: Param[];
  options?: CallOptions;
}
