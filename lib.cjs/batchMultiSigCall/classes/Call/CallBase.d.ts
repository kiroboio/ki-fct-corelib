import { CallOptions, DeepPartial, Variable } from "../../../types";
import { IMSCallInput } from "../../types";
export declare class CallBase {
    protected _call: IMSCallInput & {
        nodeId: string;
    };
    constructor(input: IMSCallInput);
    get call(): IMSCallInput & {
        nodeId: string;
    };
    get nodeId(): string;
    getOutputVariable(innerIndex?: number): Variable & {
        type: "output";
    };
    getTypesArray(): number[];
    /**
     * Returns the function signature of the call.
     * If the call has a method, it returns the function signature using the `utils.id` function.
     * Otherwise, it returns hashed empty string. (ethers.utils.id(''))
     *
     * @returns The function signature of the call or hashed empty string.
     */
    getFunctionSignature(): string;
    getFunction(): string;
    setOptions(options: DeepPartial<CallOptions>): void;
    update(call: DeepPartial<IMSCallInput>): void;
}
//# sourceMappingURL=CallBase.d.ts.map