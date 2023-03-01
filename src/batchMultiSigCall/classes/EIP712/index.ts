import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { MessageTypeProperty } from "@metamask/eth-sig-util/dist/sign-typed-data";
import { TypedDataDomain } from "types";

import { Call, Computed, EIP712Domain, Limits, Meta, Multisig, Recurrency } from "./constants";

const TYPED_DATA_DOMAIN: Record<ChainId, TypedDataDomain> = {
  "1": {
    name: "FCT Controller",
    version: "1",
    chainId: 5,
    verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
  },
  "5": {
    name: "FCT Controller",
    version: "1",
    chainId: 5,
    verifyingContract: "0x38B5249Ec6529F19aee7CE2c650CadD407a78Ed7",
    salt: "0x01004130db7959f5983e000038b5249ec6529f19aee7ce2c650cadd407a78ed7",
  },
};

interface EIP712Types {
  [key: string]: MessageTypeProperty[];
}

export class EIP712 {
  static types: EIP712Types = {
    domain: EIP712Domain,
    meta: Meta,
    limits: Limits,
    computed: Computed,
    call: Call,
    recurrency: Recurrency,
    multisig: Multisig,
  };

  static getTypedDataDomain(chainId: ChainId) {
    return TYPED_DATA_DOMAIN[chainId];
  }
}
