import { JsonFragment } from "@ethersproject/abi";
import { SignatureLike } from "@ethersproject/bytes";
import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { Fragment } from "ethers/lib/utils";
import { CallOptions, DeepRequired, IPluginCall, Param, RequiredKeys, Variable } from "../../types";
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
export type IWithPlugin = {
    plugin: {
        create(): Promise<IPluginCall | undefined>;
    };
} & MSCallMandatory;
export type IMSCallWithEncodedData = {
    nodeId?: string;
    abi: ReadonlyArray<Fragment | JsonFragment>;
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
    protocol: "ERC1155" | "ERC721";
    method: "setApprovalForAll";
    params: {
        spender: string;
        approved: boolean;
    };
}) & {
    token: string;
    from: string;
};
