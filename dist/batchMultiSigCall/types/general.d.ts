import { SignatureLike } from "@ethersproject/bytes";
import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { CallOptions, IPluginCall, Param, Variable } from "@types";
import { BatchMultiSigCallTypedData } from "./typedData";
export type FCTCallParam = string | number | boolean | FCTCallParam[] | {
    [key: string]: FCTCallParam;
};
export interface BatchMultiSigCallConstructor {
    chainId?: ChainId;
    options?: Partial<IFCTOptions>;
}
export interface IBatchMultiSigCallFCT {
    typeHash: string;
    typedData: BatchMultiSigCallTypedData;
    sessionId: string;
    nameHash: string;
    mcall: MSCall[];
    builder: string;
    variables: string[];
    externalSigners: string[];
    computed: {
        variable: string;
        add: string;
        sub: string;
        mul: string;
        div: string;
    }[];
    signatures: SignatureLike[];
}
export type PartialBatchMultiSigCall = Pick<IBatchMultiSigCallFCT, "typedData" | "signatures" | "mcall">;
export interface IMSCallInput {
    nodeId: string;
    value?: string | Variable;
    to: string | Variable;
    from: string | Variable;
    params?: Param[];
    method?: string;
    toENS?: string;
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
export interface IFCTOptions {
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
        minimumApprovals?: string;
    };
}
export interface IWithPlugin {
    nodeId: string;
    plugin: {
        create(): Promise<IPluginCall | undefined>;
    };
    from: string;
    options?: CallOptions;
}
export interface IComputed {
    variable: string | Variable;
    add?: string;
    sub?: string;
    mul?: string;
    div?: string;
}
export interface ComputedVariables {
    variable: string;
    add: string;
    sub: string;
    mul: string;
    div: string;
}
export interface IRequiredApproval {
    requiredAmount: string;
    token: string;
    spender: string;
    from: string;
}
