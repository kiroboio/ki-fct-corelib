import { CallOptions, IPlugin, Params, Validator } from "../interfaces";
export interface MSCallInput {
    value?: string;
    to: string;
    from: string;
    toENS?: string;
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
    to: string;
    data: string;
    types: number[];
    typedHashes: string[];
}
export interface MSCallOptions {
    name?: string;
    validFrom?: number;
    expiresAt?: number;
    builder?: string;
    maxGasPrice?: number;
    cancelable?: boolean;
    purgeable?: boolean;
    recurrency?: {
        maxRepeats: number;
        chillTime: number;
        accumetable: boolean;
    };
    multisig?: {
        externalSigners: string[];
        minimumApprovals: number;
    };
}
export interface IWithPlugin {
    plugin: IPlugin;
    from: string;
    options?: CallOptions;
}
export interface IInput {
    get(): unknown;
    set(params: Record<string, any>): boolean;
}
export interface IOutput {
    get(): unknown;
}
