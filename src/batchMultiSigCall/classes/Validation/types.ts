import { ValidationOperator } from "../../../constants";
import { Variable } from "../../../types";

// If there is V['id'] then { type: "validation"; id: V["id"] } else ValidationVariable
export type ValidationAddResult<V extends IValidation> = V["id"] extends string
  ? { type: "validation"; id: V["id"] }
  : ValidationVariable;

export interface ValidationVariable {
  type: "validation";
  id: string;
}

export interface IValidation {
  id?: string;
  value1: string | Variable | ValidationVariable;
  operator: keyof typeof ValidationOperator;
  value2: string | Variable | ValidationVariable;
}

export interface IValidationData {
  value1: string;
  operator: string;
  value2: string;
}

export interface IValidationEIP712 {
  index: string;
  value_1: string;
  op: string;
  value_2: string;
}
