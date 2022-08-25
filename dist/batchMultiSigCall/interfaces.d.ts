import { CallOptions, Params, Validator } from "../interfaces";
export interface MSCallInput {
    value: string;
    to: string;
    from: string;
    toEnsHash?: string;
    validator?: Validator;
    viewOnly?: boolean;
    method?: string;
    params?: Params[];
    options?: CallOptions;
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
    types: number[];
    typedHashes: string[];
}
export interface MSCallOptions {
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
        chillMode?: boolean;
    };
}
