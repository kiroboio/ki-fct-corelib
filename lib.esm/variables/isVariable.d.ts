import { ParamValue } from "../types";
type IsComputedVariableInput = {
    strict: true;
    value: ParamValue;
    id: string;
    index: number;
} | {
    strict: false;
    value: ParamValue;
    id?: string;
    index?: number;
};
export declare function isExternalVariable(value: ParamValue): boolean;
export declare function isComputedVariable({ value, id, index, strict }: IsComputedVariableInput): boolean;
export declare function isOutputVariable({ value, index }: {
    value: ParamValue;
    index: number;
}): boolean;
export {};
//# sourceMappingURL=isVariable.d.ts.map