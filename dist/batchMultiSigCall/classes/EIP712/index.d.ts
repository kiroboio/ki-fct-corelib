import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { MessageTypeProperty } from "@metamask/eth-sig-util/dist/sign-typed-data";
import { BatchMultiSigCall } from "methods";
import { BatchMultiSigCallTypedData, TypedDataDomain, TypedDataMessage, TypedDataTypes } from "types";
import { FCTBase } from "../FCTBase";
interface EIP712Types {
    [key: string]: MessageTypeProperty[];
}
export declare class EIP712 extends FCTBase {
    constructor(FCT: BatchMultiSigCall);
    static types: EIP712Types;
    static getTypedDataDomain(chainId: ChainId): TypedDataDomain;
    getTypedData(): BatchMultiSigCallTypedData;
    getTypedDataMessage(): TypedDataMessage;
    getTypedDataTypes(): TypedDataTypes;
    getTypedDataDomain(): TypedDataDomain;
    getPrimaryType(): string;
    private getPrimaryTypeTypes;
    private getCallsPrimaryType;
    private getComputedPrimaryType;
    private getTransactionTypedDataMessage;
}
export {};
