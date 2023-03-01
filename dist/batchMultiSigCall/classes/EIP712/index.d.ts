import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { MessageTypeProperty } from "@metamask/eth-sig-util/dist/sign-typed-data";
import { TypedDataDomain } from "types";
interface EIP712Types {
    [key: string]: MessageTypeProperty[];
}
export declare class EIP712 {
    static types: EIP712Types;
    static getTypedDataDomain(chainId: ChainId): TypedDataDomain;
}
export {};
