import { Variable } from "../../../types";
import { ComputedOperators } from "./computedConstants";

type IComputedOperator = (typeof ComputedOperators)[keyof typeof ComputedOperators];

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

export interface IComputedData {
  overflowProtection: boolean;
  values: [string, string, string, string];
  operators: [string, string, string];
}
