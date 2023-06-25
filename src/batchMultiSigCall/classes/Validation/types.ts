import { ValidationOperator } from "../../../constants";
import { Variable } from "../../../types";

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
