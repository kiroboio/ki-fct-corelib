import { ChainId } from "@kiroboio/fct-plugins";
import { BatchMultiSigCallTypedData, TypedDataDomain, TypedDataMessage, TypedDataTypes } from "../../types";
import { FCTBase } from "../FCTBase";
export declare class EIP712 extends FCTBase {
    private _lastVersion;
    private _VersionClass;
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
    private _getVersionClass;
}
//# sourceMappingURL=index.d.ts.map