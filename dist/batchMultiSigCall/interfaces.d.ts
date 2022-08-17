import { TypedData } from "ethers-eip712";
import { Flow } from "../constants";
import { MultiCallBase, Validator } from "../interfaces";
export interface MSCallInput extends Omit<MultiCallBase, "flags"> {
    value: string;
    to: string;
    from: string;
    toEnsHash?: string;
    validator?: Validator;
    flow?: Flow;
    jump?: number;
    viewOnly?: boolean;
}
export interface BatchMSCallInput {
    calls: MSCallInput[];
    name?: string;
    validFrom?: number;
    expiresAt?: number;
    maxGasPrice?: number;
    cancelable?: boolean;
    recurrency?: {
        maxRepeats: number;
        chillTime: number;
        accumetable: boolean;
    };
    multisig?: {
        externalSigners: string[];
        minimumApprovals: number;
    };
    flags?: {
        payment: boolean;
    };
}
export interface MSCall {
    typeHash: string;
    ensHash: string;
    functionSignature: string;
    value: string;
    from: string;
    gasLimit: number;
    flags: string;
    to: string;
    data: string;
    types: string[];
    typedHashes: string[];
}
export interface BatchMSCall {
    typeHash: string;
    sessionId: string;
    typedData: TypedData;
    inputData: BatchMSCallInput;
    name: string;
    mcall: MSCall[];
    addCall: (tx: MSCallInput, index?: number) => Promise<BatchMSCall | Error>;
    replaceCall: (tx: MSCallInput, index: number) => Promise<MSCall | Error>;
    removeCall: (index: number) => Promise<MSCall | Error>;
    getCall: (index: number) => MSCall;
    get length(): number;
}
