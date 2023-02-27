import { MessageTypeProperty } from "@metamask/eth-sig-util/dist/sign-typed-data";

import { Call, Computed, EIP712Domain, Limits, Meta, Multisig, Recurrency } from "./helpers";

export class EIP712 {
  static domain: MessageTypeProperty[] = EIP712Domain;
  static meta: MessageTypeProperty[] = Meta;
  static limits: MessageTypeProperty[] = Limits;
  static computed: MessageTypeProperty[] = Computed;
  static call: MessageTypeProperty[] = Call;
  static recurrency: MessageTypeProperty[] = Recurrency;
  static multisig: MessageTypeProperty[] = Multisig;
}
