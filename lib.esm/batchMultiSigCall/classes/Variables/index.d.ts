import { Variable } from "../../../types";
import { FCTBase } from "../FCTBase";
import { AddComputedResult, IComputed, IComputedData, IComputedEIP712 } from "./types";
export declare class Variables extends FCTBase {
    protected _computed: Required<IComputed>[];
    get computed(): Required<IComputed>[];
    get computedAsData(): IComputedData[];
    get computedForEIP712(): IComputedEIP712[];
    isExternalVariableUsed(): boolean;
    addComputed<C extends Partial<IComputed>>(computed: C): AddComputedResult<C>;
    getVariable(variable: Variable, type: string): string;
    private getOutputVariable;
    private getExternalVariable;
    private getComputedVariable;
    getValue(value: undefined | Variable | string, type: string, ifValueUndefined?: string): string;
    getVariablesAsBytes32: (variables: string[]) => string[];
    static getVariablesAsBytes32: (variables: string[]) => string[];
}
//# sourceMappingURL=index.d.ts.map