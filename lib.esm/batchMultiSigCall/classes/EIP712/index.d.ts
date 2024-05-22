import { ChainId } from "@kiroboio/fct-plugins";
import { MessageTypeProperty } from "@metamask/eth-sig-util";
import { BatchMultiSigCallTypedData, TypedDataDomain, TypedDataMessage, TypedDataTypes } from "../../types";
import { FCTBase } from "../FCTBase";
export declare class EIP712 extends FCTBase {
    static types: {
        readonly domain: MessageTypeProperty[];
        readonly meta: MessageTypeProperty[];
        readonly engine: MessageTypeProperty[];
        readonly limits: MessageTypeProperty[];
        readonly computed: MessageTypeProperty[];
        readonly call: MessageTypeProperty[];
        readonly recurrency: MessageTypeProperty[];
        readonly multisig: MessageTypeProperty[];
        readonly validation: MessageTypeProperty[];
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
    private getValidationPrimaryType;
    private getTransactionTypedDataMessage;
    private getValidationMessage;
    private getComputedVariableMessage;
    private getCallTypesAndStructs;
}
//# sourceMappingURL=index.d.ts.map