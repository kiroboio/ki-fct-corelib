import { Variable } from "../../../types";
import { ComputedOperators } from "./computedConstants";

type IComputedOperator = (typeof ComputedOperators)[keyof typeof ComputedOperators];

export type AddComputedResult<C extends Partial<IComputed>> = C["id"] extends string
  ? { type: "computed"; id: C["id"] }
  : { type: "computed"; id: string };

export interface IComputed {
  id?: string;
  value1: string | Variable;
  operator1: IComputedOperator;
  value2: string | Variable;
  operator2: IComputedOperator;
  value3: string | Variable;
  operator3: IComputedOperator;
  value4: string | Variable;
  overflowProtection: boolean;
}

export interface IComputedEIP712 {
  index: string;
  value_1: string;
  op_1: string;
  value_2: string;
  op_2: string;
  value_3: string;
  op_3: string;
  value_4: string;
  overflow_protection: boolean;
}

export interface IComputedData {
  overflowProtection: boolean;
  values: [string, string, string, string];
  operators: [string, string, string];
}
