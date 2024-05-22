import { SignatureLike } from "@ethersproject/bytes";
import { ethers } from "ethers";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";
import { ISimpleTxTrace } from "./types";
export declare class FCTUtils extends FCTBase {
    private _eip712;
    private _cache;
    constructor(FCT: BatchMultiSigCall);
    get FCTData(): import("../../types").IFCT;
    getAllRequiredApprovals(): Promise<import("../../types").IRequiredApproval[]>;
    getCalldataForActuator({ signatures, purgedFCT, investor, activator, externalSigners, variables, }: {
        signatures: SignatureLike[];
        purgedFCT?: string;
        investor?: string;
        activator: string;
        externalSigners?: string[];
        variables?: string[];
    }): string;
    getAuthenticatorSignature(): SignatureLike;
    recoverAddress(signature: SignatureLike): string | null;
    getMessageHash(): string;
    isValid(softValidation?: boolean): {
        valid: boolean;
        message: string | null;
    };
    getSigners(): string[];
    getAllPaths(): string[][];
    getAssetFlow(): Promise<(never[] | {
        path: string[];
        assetFlow: {
            address: string;
            toSpend: any[];
            toReceive: any[];
        }[];
    })[]>;
    kiroPerPayerGas: ({ gas, gasPrice, penalty, ethPriceInKIRO, fees, }: {
        gas: string | bigint;
        gasPrice: string | bigint;
        penalty?: string | number;
        ethPriceInKIRO: string | bigint;
        fees?: {
            baseFeeBPS?: number;
            bonusFeeBPS?: number;
        };
    }) => {
        ethCost: string;
        kiroCost: string;
    };
    getPaymentPerPayer: ({ signatures, gasPrice, maxGasPrice, ethPriceInKIRO, penalty, fees, }: {
        signatures?: SignatureLike[];
        gasPrice?: number | string | bigint;
        maxGasPrice?: number | string | bigint;
        ethPriceInKIRO: string | bigint;
        penalty?: number | string;
        fees?: {
            baseFeeBPS?: number | string;
            bonusFeeBPS?: number | string;
        };
    }) => {
        payer: string;
        largestPayment: {
            gas: string;
            tokenAmountInWei: string;
            nativeAmountInWei: string;
            tokenAmount: string;
            nativeAmount: string;
        };
        smallestPayment: {
            gas: string;
            tokenAmountInWei: string;
            nativeAmountInWei: string;
            tokenAmount: string;
            nativeAmount: string;
        };
    }[];
    getPaymentPerSender: ({ signatures, gasPrice, maxGasPrice, ethPriceInKIRO, penalty, fees, }: {
        signatures?: SignatureLike[];
        gasPrice?: number | string | bigint;
        maxGasPrice?: number | string | bigint;
        ethPriceInKIRO: string | bigint;
        penalty?: number | string;
        fees?: {
            baseFeeBPS?: number | string;
            bonusFeeBPS?: number | string;
        };
    }) => {
        payer: string;
        largestPayment: {
            gas: string;
            tokenAmountInWei: string;
            nativeAmountInWei: string;
            tokenAmount: string;
            nativeAmount: string;
        };
        smallestPayment: {
            gas: string;
            tokenAmountInWei: string;
            nativeAmountInWei: string;
            tokenAmount: string;
            nativeAmount: string;
        };
    }[];
    getMaxGas: () => string;
    getCallResults: ({ rpcUrl, provider, txHash, }: {
        rpcUrl?: string;
        provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider;
        txHash: string;
    }) => Promise<{
        index: string;
        result: "SUCCESS" | "FAILED" | "SKIPPED";
    }[]>;
    getTransactionTrace: ({ txHash, tenderlyRpcUrl, tries, }: {
        txHash: string;
        tenderlyRpcUrl: string;
        tries?: number;
    }) => Promise<import("./types").ITxTrace | undefined>;
    getSimpleTransactionTrace: ({ txHash, rpcUrl }: {
        txHash: string;
        rpcUrl: string;
    }) => Promise<ISimpleTxTrace>;
    usesExternalVariables(): boolean;
}
//# sourceMappingURL=index.d.ts.map