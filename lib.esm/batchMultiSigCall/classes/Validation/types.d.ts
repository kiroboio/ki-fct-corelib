import { ValidationOperator } from "../../../constants";
import { Variable } from "../../../types";
export type ValidationAddResult<V extends IValidation<true>> = V["id"] extends string ? {
    type: "validation";
    id: V["id"];
} : ValidationVariable;
export interface ValidationVariable {
    type: "validation";
    id: string;
}
export type IValidationValue<WithIValidation extends boolean> = WithIValidation extends true ? string | Variable | ValidationVariable | IValidation<WithIValidation> : string | Variable | ValidationVariable;
export interface IValidation<WithIValidation extends boolean> {
    id?: string;
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
    op: keyof typeof ValidationOperator;
    value_2: string;
}
//# sourceMappingURL=types.d.ts.map