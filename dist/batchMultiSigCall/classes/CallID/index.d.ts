import { Flow } from "../../../constants";
import { IMSCallInput, StrictMSCallInput } from "../../types";
export declare class CallID {
    static asString({ calls, call, index }: {
        calls: IMSCallInput[];
        call: StrictMSCallInput;
        index: number;
    }): string;
    static parse(callId: string): {
        options: {
            gasLimit: string;
            flow: Flow;
            jumpOnSuccess: string;
            jumpOnFail: string;
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
        };
        viewOnly: boolean;
        permissions: string;
        payerIndex: number;
        callIndex: number;
    };
}
