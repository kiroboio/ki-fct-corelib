import { Variable } from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";
import { AddComputedResult, IComputed, IComputedData, IComputedEIP712 } from "./types";
export declare class Variables extends FCTBase {
    protected _computed: Required<IComputed>[];
    constructor(FCT: BatchMultiSigCall);
    get computed(): Required<IComputed>[];
    get computedAsData(): IComputedData[];
    get computedForEIP712(): IComputedEIP712[];
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