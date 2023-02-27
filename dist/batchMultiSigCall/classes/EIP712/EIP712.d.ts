import { MessageTypeProperty } from "@metamask/eth-sig-util/dist/sign-typed-data";
export declare class EIP712 {
    static domain: MessageTypeProperty[];
    static meta: MessageTypeProperty[];
    static limits: MessageTypeProperty[];
    static computed: MessageTypeProperty[];
    static call: MessageTypeProperty[];
    static recurrency: MessageTypeProperty[];
    static multisig: MessageTypeProperty[];
}
