import { JsonFragment } from "@ethersproject/abi";
import { SignatureLike } from "@ethersproject/bytes";
import { ChainId } from "@kiroboio/fct-plugins";
import { ethers } from "ethers";

import {
  CallOptions,
  DeepPartial,
  DeepRequired,
  IPluginCall,
  Param,
  ParamWithoutVariable,
  RequiredKeys,
  Variable,
} from "../../../types";
import { FCTMulticall } from "../classes";
import { BatchMultiSigCallTypedData } from "./typedData";

export type FCTCallParam = string | number | boolean | FCTCallParam[] | { [key: string]: FCTCallParam };

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

export interface MSCallDefaults {
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
} & MSCallDefaults;

export type FCTMCall = RequiredKeys<IMSCallInput, "nodeId"> | FCTMulticall;

export type StrictMSCallInput = RequiredKeys<IMSCallInput, "from" | "value" | "nodeId" | "options"> & {
  options: DeepRequired<CallOptions>;
  multicall?: FCTMulticall;
};

export interface DecodedCalls extends StrictMSCallInput {
  params?: ParamWithoutVariable<Param>[];
}

export type IWithPlugin = {
  plugin: {
    create(): Promise<IPluginCall | undefined>;
  };
} & MSCallDefaults;

export type IMSCallWithEncodedData = {
  nodeId?: string;
  abi: ReadonlyArray<ethers.utils.Fragment | JsonFragment> | string[];
  encodedData: string;
  to: string | Variable;
} & MSCallDefaults;

export type FCTCall = IMSCallInput | IWithPlugin | IMSCallWithEncodedData | FCTMulticall;

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

export type IRequiredApproval = (
  | {
      protocol: "ERC20";
      method: "approve";
      params: {
        spender: string;
        amount: string;
      };
    }
  | {
      protocol: "ERC721";
      method: "approve";
      params: {
        spender: string;
        tokenId: string;
      };
    }
  | {
      protocol: "ERC1155" | "ERC721";
      method: "setApprovalForAll";
      params: {
        spender: string;
        approved: boolean;
        ids: string[];
      };
    }
  | {
      protocol: "AAVE";
      method: "approveDelegation";
      params: {
        delegatee: string;
        amount: string;
      };
    }
) & {
  token: string;
  from: string;
};
export type ICallDefaults = Omit<RequiredKeys<MSCallDefaults, "value">, "nodeId"> & {
  options: DeepRequired<CallOptions>;
};
