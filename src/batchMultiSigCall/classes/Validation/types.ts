import { ValidationOperator } from "../../../constants";
import { Variable } from "../../../types";

// If there is V['id'] then { type: "validation"; id: V["id"] } else ValidationVariable
export type ValidationAddResult<V extends IValidation<true>> = V["id"] extends string
  ? { type: "validation"; id: V["id"] }
  : ValidationVariable;

export interface ValidationVariable {
  type: "validation";
  id: string;
}

export type IValidationValue<WithIValidation extends boolean> = WithIValidation extends true
  ? string | Variable | ValidationVariable | IValidation<WithIValidation>
  : string | Variable | ValidationVariable;

export interface IValidation<WithIValidation extends boolean> {
  id?: string;
  // If WithoutIValidation is true, then value1 and value2 are string | Variable | ValidationVariable
  value1: IValidationValue<WithIValidation>;
  operator: keyof typeof ValidationOperator;
  value2: IValidationValue<WithIValidation>;
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
