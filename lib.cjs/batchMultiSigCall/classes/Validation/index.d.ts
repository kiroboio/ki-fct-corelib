import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";
import { IValidation, IValidationData, IValidationEIP712, ValidationAddResult } from "./types";
export declare class Validation extends FCTBase {
    protected _validations: Required<IValidation<false>>[];
    constructor(FCT: BatchMultiSigCall);
    get(): Required<IValidation<false>>[];
    getForEIP712(): IValidationEIP712[];
    getForData(): IValidationData[];
    getIndex(id: string): number;
    add<V extends IValidation<true>>({ nodeId, validation, }: {
        nodeId: string;
        validation: V;
    }): ValidationAddResult<V>;
    addValidation(validation: IValidation<true>): string;
    private handleVariable;
    private isIValidation;
}
//# sourceMappingURL=index.d.ts.map