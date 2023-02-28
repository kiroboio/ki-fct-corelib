import { MessageTypeProperty } from "@metamask/eth-sig-util/dist/sign-typed-data";
interface EIP712Types {
    [key: string]: MessageTypeProperty[];
}
export declare class EIP712 {
    static types: EIP712Types;
}
export {};
