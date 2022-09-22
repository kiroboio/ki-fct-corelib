import { TypedData } from "ethers-eip712";
import { CallOptions, IPlugin, Params, Validator, Variable } from "../interfaces";
export interface IBatchMultiSigCallFCT {
    typeHash: string;
    typedData: TypedData;
    sessionId: string;
    nameHash: string;
    mcall: MSCall[];
    builder: string;
}
export interface MSCallInput {
    nodeId: string;
    value?: string | Variable;
    to: string | Variable;
    from: string | Variable;
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
    blockable: boolean;
    purgeable: boolean;
    builder: string;
    recurrency?: {
        maxRepeats?: string;
        chillTime?: string;
        accumetable?: boolean;
    };
    multisig?: {
        externalSigners?: string[];
        minimumApprovals?: number;
    };
}
export interface IWithPlugin {
    nodeId: string;
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
