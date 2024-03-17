import { Flow } from "../../../constants";
import { IMSCallInput, StrictMSCallInput } from "../../types";
import { Validation } from "../Validation";
export declare class CallID {
    static asString({ calls, validation, call, index, payerIndex, }: {
        calls: IMSCallInput[];
        validation: Validation;
        call: StrictMSCallInput;
        index: number;
        payerIndex?: number;
    }): string;
    static parse(callId: string): {
        options: {
            gasLimit: string;
            flow: Flow;
            jumpOnSuccess: string;
            jumpOnFail: string;
            validation: string;
        };
        viewOnly: boolean;
        permissions: string;
        payerIndex: number;
        callIndex: number;
    };
    static parseWithNumbers(callId: string): {
        options: {
            gasLimit: string;
            flow: Flow;
            jumpOnSuccess: number;
            jumpOnFail: number;
            validation: number;
        };
        viewOnly: boolean;
        permissions: string;
        payerIndex: number;
        callIndex: number;
    };
    private static destructCallId;
    private static getFlow;
}
//# sourceMappingURL=index.d.ts.map