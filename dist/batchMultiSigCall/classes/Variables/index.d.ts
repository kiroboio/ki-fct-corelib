import { IComputed, Variable } from "types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";
export declare class Variables extends FCTBase {
    _computed: Required<IComputed>[];
    constructor(FCT: BatchMultiSigCall);
    get computed(): Required<IComputed>[];
    get computedWithValues(): {
        index: string;
        value: string;
        add: string;
        sub: string;
        mul: string;
        pow: string;
        div: string;
        mod: string;
    }[];
    addComputed(computed: IComputed): Variable & {
        type: "computed";
    };
    getVariable(variable: Variable, type: string): string;
    getOutputVariable(index: number, innerIndex: number, type: string): string;
    getExternalVariable(index: number, type: string): string;
    getComputedVariable(index: number, type: string): string;
    getValue(value: undefined | Variable | string, type: string, ifValueUndefined?: string): string;
}
