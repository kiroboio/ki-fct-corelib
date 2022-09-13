import { TypedData } from "ethers-eip712";
import { CallOptions, IPlugin, Params, Validator } from "../interfaces";
export interface IBatchMultiSigCallFCT {
    typeHash: string;
    typedData: TypedData;
    sessionId: string;
    nameHash: string;
    mcall: MSCall[];
    builder: string;
}
export interface MSCallInput {
    value?: string;
    to: string;
    from: string;
    params?: Params[];
    method?: string;
    toENS?: string;
    validator?: Validator;
    viewOnly?: boolean;
    options?: CallOptions;
}
export interface MSCall {
    typeHash: string;
    ensHash: string;
    functionSignature: string;
    value: string;
    callId: string;
    from: string;
    to: string;
    data: string;
    types: number[];
    typedHashes: string[];
}
export interface MSCallOptions {
    name?: string;
    validFrom: string;
    expiresAt: string;
    maxGasPrice: string;
    cancelable: boolean;
    purgeable: boolean;
    builder: string;
    recurrency?: {
        maxRepeats?: number;
        chillTime?: number;
        accumetable?: boolean;
    };
    multisig?: {
        externalSigners?: string[];
        minimumApprovals?: number;
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
