import { TypedData } from "ethers-eip712";
import { Flow } from "../constants";
import { MultiCallBase, Validator } from "../interfaces";
export interface MultiSigCallInputInterface extends Omit<MultiCallBase, "flags"> {
    value: string;
    to: string;
    toEnsHash?: string;
    from: string;
    fromVariableId?: string;
    validator?: Validator;
    flow?: Flow;
    jump?: number;
    viewOnly?: boolean;
}
export interface BatchMultiSigCallInputInterface {
    name?: string;
    validFrom?: number;
    expiresAt?: number;
    gasPriceLimit?: number;
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
    calls: MultiSigCallInputInterface[];
}
export interface MultiSigCallInterface {
    typeHash: string;
    functionSignature: string;
    value: string;
    from: string;
    gasLimit: number;
    flags: string;
    to: string;
    ensHash?: string;
    data: string;
}
export interface BatchMultiSigCallInterface {
    typeHash: string;
    sessionId: string;
    typedData: TypedData;
    inputData: BatchMultiSigCallInputInterface;
    mcall: MultiSigCallInterface[];
    addCall: (tx: MultiSigCallInputInterface, index?: number) => Promise<BatchMultiSigCallInterface>;
    replaceCall: (tx: MultiSigCallInputInterface, index: number) => Promise<BatchMultiSigCallInterface>;
    removeCall: (index: number) => Promise<BatchMultiSigCallInterface>;
    getCall: (index: number) => BatchMultiSigCallInterface;
    get length(): number;
}
