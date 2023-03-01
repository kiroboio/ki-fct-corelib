import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { IBatchMultiSigCallFCT, RequiredFCTOptions, TypedDataDomain } from "types";
export declare class ImportFCT {
    options: RequiredFCTOptions;
    randomId: string;
    version: string;
    chainId: ChainId;
    domain: TypedDataDomain;
    constructor(FCT: IBatchMultiSigCallFCT);
}
