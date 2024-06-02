import { AllPlugins } from "@kiroboio/fct-plugins";
import { BatchMultiSigCallTypedData, CallOptions, DecodedCalls, DeepPartial, DeepRequired, IWithPlugin, MSCall, StrictMSCallInput, TypedDataMessageTransaction } from "../../../types";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { IMSCallInput, MSCall_Eff } from "../../types";
import { IValidation, ValidationVariable } from "../Validation/types";
import { CallBase } from "./CallBase";
import { ICall } from "./types";
export declare class Call extends CallBase implements ICall {
    protected FCT: BatchMultiSigCall;
    readonly plugin: InstanceType<AllPlugins> | undefined;
    isImport?: boolean;
    constructor({ FCT, input, isImport, plugin, }: {
        FCT: BatchMultiSigCall;
        input: IMSCallInput;
        isImport?: boolean;
        plugin?: InstanceType<AllPlugins>;
    });
    update(call: DeepPartial<IMSCallInput>): StrictMSCallInput;
    addValidation(validation: IValidation<true>): ValidationVariable;
    get options(): DeepRequired<CallOptions>;
    isComputedUsed(id: string, index: number): boolean;
    isExternalVariableUsed(): boolean;
    get(): StrictMSCallInput;
    getDecoded(): DecodedCalls;
    getAsMCall(typedData: BatchMultiSigCallTypedData, index: number): MSCall;
    getAsEfficientMCall(index: number): MSCall_Eff;
    generateEIP712Type(index: number): {
        structTypes: {
            [key: string]: {
                name: string;
                type: string;
            }[];
        };
        callType: {
            name: string;
            type: string;
        }[];
    };
    generateEIP712Message(index: number): TypedDataMessageTransaction;
    getTypedHashes(index: number): string[];
    getEncodedData(): string;
    getEncodedDataWithSignature(): string;
    decodeData({ inputData, outputData }: {
        inputData: string;
        outputData?: string;
    }): {
        inputData: any[];
        outputData: any[] | null;
    } | null;
    decodeOutputData(data: string): any[] | null;
    private _getUsedStructTypes;
    private _getStructType;
    private _getParamsEIP712;
    private _getJumps;
    private _decodeParams;
    private _verifyCall;
    static create({ call, FCT }: {
        call: IMSCallInput | IWithPlugin;
        FCT: BatchMultiSigCall;
    }): Promise<Call>;
    private static _createWithPlugin;
    private static _createSimpleCall;
}
//# sourceMappingURL=Call.d.ts.map