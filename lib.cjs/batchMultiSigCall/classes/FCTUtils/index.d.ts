import { SignatureLike } from "@ethersproject/bytes";
import { ethers } from "ethers";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";
import { ISimpleTxTrace, ITxTrace } from "./types";
export declare class FCTUtils extends FCTBase {
    private _eip712;
    private _cache;
    constructor(FCT: BatchMultiSigCall);
    get FCTData(): import("../../types").IFCT;
    getAllRequiredApprovals(): Promise<import("../../types").IRequiredApproval[]>;
    getCalldataForActuator({ signatures, purgedFCT, investor, activator, }: {
        signatures: SignatureLike[];
        purgedFCT: string;
        investor: string;
        activator: string;
    }): string;
    getAuthenticatorSignature(): SignatureLike;
    recoverAddress(signature: SignatureLike): string | null;
    getMessageHash(): string;
    isValid(softValidation?: boolean): boolean | Error;
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
        penalty?: string | number | undefined;
        ethPriceInKIRO: string | bigint;
        fees?: {
            baseFeeBPS?: number | undefined;
            bonusFeeBPS?: number | undefined;
        } | undefined;
    }) => {
        ethCost: string;
        kiroCost: string;
    };
    getPaymentPerPayer: ({ signatures, gasPrice, maxGasPrice, ethPriceInKIRO, penalty, fees, }: {
        signatures?: SignatureLike[] | undefined;
        gasPrice?: string | number | bigint | undefined;
        maxGasPrice?: string | number | bigint | undefined;
        ethPriceInKIRO: string | bigint;
        penalty?: string | number | undefined;
        fees?: {
            baseFeeBPS?: string | number | undefined;
            bonusFeeBPS?: string | number | undefined;
        } | undefined;
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
        rpcUrl?: string | undefined;
        provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider | undefined;
        txHash: string;
    }) => Promise<{
        index: string;
        result: "SUCCESS" | "FAILED" | "SKIPPED";
    }[]>;
    getTransactionTrace: ({ txHash, tenderlyRpcUrl, tries, }: {
        txHash: string;
        tenderlyRpcUrl: string;
        tries?: number | undefined;
    }) => Promise<ITxTrace | undefined>;
    getSimpleTransactionTrace: ({ txHash, rpcUrl }: {
        txHash: string;
        rpcUrl: string;
    }) => Promise<ISimpleTxTrace>;
    private _validateFCTKeys;
}
//# sourceMappingURL=index.d.ts.map