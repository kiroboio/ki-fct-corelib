import { JsonFragment } from "@ethersproject/abi";
import { SignatureLike } from "@ethersproject/bytes";
import { ChainId } from "@kiroboio/fct-plugins";
import { ethers } from "ethers";
import { CallOptions, DeepPartial, DeepRequired, IPluginCall, Param, ParamWithoutVariable, RequiredKeys, Variable } from "../../types";
import { Call } from "../classes";
import { IValidation, IValidationData } from "../classes/Validation/types";
import { IComputedData } from "../classes/Variables/types";
import { BatchMultiSigCallTypedData } from "./typedData";
export type FCTCallParam = string | number | boolean | FCTCallParam[] | {
    [key: string]: FCTCallParam;
};
export interface BatchMultiSigCallConstructor {
    chainId?: ChainId | number;
    options?: Partial<IFCTOptions>;
    defaults?: DeepPartial<ICallDefaults>;
    domain?: BatchMultiSigCallTypedData["domain"];
    version?: `0x${string}`;
}
export interface IFCT {
    typedData: BatchMultiSigCallTypedData;
    typeHash: string;
    sessionId: string;
    nameHash: string;
    appHash: string;
    appVersionHash: string;
    builderHash: string;
    domainHash: string;
    verifierHash: string;
    builderAddress: string;
    mcall: MSCall[];
    signatures: SignatureLike[];
    variables: string[];
    externalSigners: string[];
    computed: IComputedData[];
    validations: IValidationData[];
}
export interface MSCallBase {
    nodeId?: string;
    from?: string | Variable;
    value?: string | Variable;
    options?: CallOptions;
    addValidation?: IValidation<true>;
}
export type IMSCallInput = {
    to: string | Variable;
    params?: Param[];
    method?: string;
    toENS?: string;
} & MSCallBase;
export type FCTMCall = RequiredKeys<IMSCallInput, "nodeId">;
export type StrictMSCallInput = RequiredKeys<IMSCallInput, "from" | "value" | "nodeId" | "options"> & {
    options: DeepRequired<CallOptions>;
};
export interface DecodedCalls extends StrictMSCallInput {
    params?: ParamWithoutVariable<Param>[];
}
export interface IPlugin {
    create(): Promise<IPluginCall | undefined> | (IPluginCall | undefined);
}
export type IWithPlugin = {
    plugin: IPlugin;
} & MSCallBase;
export type IMSCallWithEncodedData = {
    nodeId?: string;
    abi: ReadonlyArray<ethers.utils.Fragment | JsonFragment> | string[];
    encodedData: string;
    to: string | Variable;
} & MSCallBase;
export type FCTCall = Call;
export type FCTInputCall = IMSCallInput | IWithPlugin | FCTCall;
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
export interface MSCall_Eff {
    to: string;
    value: string;
    data: string;
    callid: string;
}
export interface MSCalls_Eff {
    mcall: MSCall_Eff[];
    computed: IComputedData[];
    validations: IValidationData[];
}
export interface IFCTOptions {
    id: string;
    name: string;
    validFrom: string;
    expiresAt: string;
    maxGasPrice: string;
    payableGasLimitInKilo: string;
    blockable: boolean;
    purgeable: boolean;
    authEnabled: boolean;
    dryRun: boolean;
    verifier: string;
    domain: string;
    app: {
        name: string;
        version: string;
    };
    builder: {
        name: string;
        address: string;
    };
    recurrency: {
        maxRepeats: string;
        chillTime: string;
        accumetable: boolean;
    };
    multisig: {
        externalSigners?: string[];
        minimumApprovals?: string;
    };
}
export type RequiredFCTOptions = DeepRequired<IFCTOptions>;
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
export type ICallDefaults = Omit<RequiredKeys<Partial<MSCallBase>, "value">, "nodeId"> & {
    options: DeepRequired<Omit<CallOptions, "payerIndex">>;
};
//# sourceMappingURL=general.d.ts.map