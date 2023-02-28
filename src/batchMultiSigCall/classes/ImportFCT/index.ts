import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { parseSessionID } from "batchMultiSigCall/helpers";
import _ from "lodash";
import { IBatchMultiSigCallFCT, RequiredFCTOptions, TypedDataDomain } from "types";

export class ImportFCT {
  public options: RequiredFCTOptions;
  public randomId: string;
  public version: string;
  public chainId: ChainId;
  public domain: TypedDataDomain;

  constructor(FCT: IBatchMultiSigCallFCT) {
    const { meta } = FCT.typedData.message;
    const domain = FCT.typedData.domain;

    const sessionIdOptions = parseSessionID(FCT.sessionId, FCT.builder, FCT.externalSigners);
    const name = meta.name;
    this.options = _.merge({}, sessionIdOptions, { name });
    this.randomId = meta.random_id;
    this.version = meta.version;
    this.chainId = domain.chainId.toString() as ChainId;
    this.domain = domain;
  }
}
