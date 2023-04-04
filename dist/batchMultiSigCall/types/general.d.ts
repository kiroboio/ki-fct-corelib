import { JsonFragment } from "@ethersproject/abi";
import { SignatureLike } from "@ethersproject/bytes";
import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { Fragment } from "ethers/lib/utils";
import { CallOptions, DeepPartial, DeepRequired, IPluginCall, Param, ParamWithoutVariable, RequiredKeys, Variable } from "../../types";
import { BatchMultiSigCallTypedData } from "./typedData";
export type FCTCallParam = string | number | boolean | FCTCallParam[] | {
    [key: string]: FCTCallParam;
};
export interface BatchMultiSigCallConstructor {
    chainId?: ChainId;
    options?: Partial<IFCTOptions>;
    defaults?: DeepPartial<ICallDefaults>;
    domain?: BatchMultiSigCallTypedData["domain"];
    version?: `0x${string}`;
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
    computed: Omit<ComputedVariable, "index">[];
    signatures: SignatureLike[];
}
export type PartialBatchMultiSigCall = Pick<IBatchMultiSigCallFCT, "typedData" | "signatures" | "mcall">;
export interface MSCallMandatory {
    nodeId?: string;
    from?: string | Variable;
    value?: string | Variable;
    options?: CallOptions;
}
export type IMSCallInput = {
    to: string | Variable;
    params?: Param[];
    method?: string;
    toENS?: string;
} & MSCallMandatory;
export type IMSCallInputWithNodeId = RequiredKeys<IMSCallInput, "nodeId">;
export type StrictMSCallInput = RequiredKeys<IMSCallInput, "from" | "value" | "nodeId" | "options"> & {
    options: DeepRequired<CallOptions>;
};
export interface DecodedCalls extends StrictMSCallInput {
    params?: ParamWithoutVariable[];
}
export type IWithPlugin = {
    plugin: {
        create(): Promise<IPluginCall | undefined>;
    };
} & MSCallMandatory;
export type IMSCallWithEncodedData = {
    nodeId?: string;
    abi: ReadonlyArray<Fragment | JsonFragment> | string[];
    encodedData: string;
    to: string | Variable;
} & MSCallMandatory;
export type FCTCall = IMSCallInput | IWithPlugin | IMSCallWithEncodedData;
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
    authEnabled: boolean;
    recurrency?: {
        maxRepeats: string;
        chillTime: string;
        accumetable: boolean;
    };
    multisig?: {
        externalSigners?: string[];
        minimumApprovals?: string;
    };
}
export type RequiredFCTOptions = DeepRequired<IFCTOptions>;
type IComputedValue = string | Variable;
export interface IComputed {
    id?: string;
    value: IComputedValue;
    add?: IComputedValue;
    sub?: IComputedValue;
    pow?: IComputedValue;
    mul?: IComputedValue;
    div?: IComputedValue;
    mod?: IComputedValue;
}
export interface ComputedVariable {
    index: string;
    value: string;
    add: string;
    sub: string;
    pow: string;
    mul: string;
    div: string;
    mod: string;
}
export type IRequiredApproval = ({
    protocol: "ERC20";
    method: "approve";
    params: {
        spender: string;
        amount: string;
    };
} | {
    protocol: "ERC721";
    method: "approve";
    params: {
        spender: string;
        tokenId: string;
    };
} | {
    protocol: "ERC721";
    method: "setApprovalForAll";
    params: {
        spender: string;
        approved: boolean;
    };
} | {
    protocol: "ERC1155";
    method: "setApprovalForAll";
    params: {
        spender: string;
        approved: boolean;
        ids: string[];
    };
} | {
    protocol: "AAVE";
    method: "approveDelegation";
    params: {
        delegatee: string;
        amount: string;
    };
}) & {
    token: string;
    from: string;
};
export type ICallDefaults = Omit<RequiredKeys<MSCallMandatory, "value">, "nodeId"> & {
    options: DeepRequired<CallOptions>;
};
export {};
