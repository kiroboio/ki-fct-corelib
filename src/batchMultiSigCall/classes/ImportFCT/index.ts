import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { IBatchMultiSigCallFCT, RequiredFCTOptions, TypedDataDomain } from "types";

import { SessionID } from "../SessionID";

export class ImportFCT {
  public options: RequiredFCTOptions;
  public randomId: string;
  public version: string;
  public chainId: ChainId;
  public domain: TypedDataDomain;

  constructor(FCT: IBatchMultiSigCallFCT) {
    const { meta } = FCT.typedData.message;
    const domain = FCT.typedData.domain;

    const sessionIdOptions = SessionID.fromFCT(FCT);
    this.options = sessionIdOptions;
    this.randomId = meta.random_id;
    this.version = meta.version;
    this.chainId = domain.chainId.toString() as ChainId;
    this.domain = domain;
  }
}
