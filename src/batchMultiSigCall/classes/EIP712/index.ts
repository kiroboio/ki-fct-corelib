import { MessageTypeProperty } from "@metamask/eth-sig-util/dist/sign-typed-data";

import { Call, Computed, EIP712Domain, Limits, Meta, Multisig, Recurrency } from "./constants";

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
}
