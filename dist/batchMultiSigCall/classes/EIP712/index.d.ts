import { ChainId } from "@kirobo/ki-eth-fct-provider-ts";
import { MessageTypeProperty } from "@metamask/eth-sig-util/dist/sign-typed-data";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { BatchMultiSigCallTypedData, TypedDataDomain, TypedDataMessage, TypedDataTypes } from "../../types";
import { FCTBase } from "../FCTBase";
export declare class EIP712 extends FCTBase {
    constructor(FCT: BatchMultiSigCall);
    static types: {
        readonly domain: MessageTypeProperty[];
        readonly meta: MessageTypeProperty[];
        readonly limits: MessageTypeProperty[];
        readonly computed: MessageTypeProperty[];
        readonly call: MessageTypeProperty[];
        readonly recurrency: MessageTypeProperty[];
        readonly multisig: MessageTypeProperty[];
    };
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
