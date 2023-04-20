import { SignatureLike } from "@ethersproject/bytes";
import { ethers } from "ethers";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";
export declare class FCTUtils extends FCTBase {
    private _eip712;
    constructor(FCT: BatchMultiSigCall);
    get FCTData(): import("../../types").IBatchMultiSigCallFCT;
    getAllRequiredApprovals(): Promise<import("../../types").IRequiredApproval[]>;
    getCalldataForActuator({ signatures, purgedFCT, investor, activator, }: {
        signatures: SignatureLike[];
        purgedFCT: string;
        investor: string;
        activator: string;
    }): string;
    getAuthenticatorSignature(): SignatureLike;
    recoverAddress(signature: SignatureLike): string | null;
    getOptions(): {
        valid_from: string;
        expires_at: string;
        gas_price_limit: string;
        blockable: boolean;
        purgeable: boolean;
        builder: string;
        recurrency: {
            accumetable: boolean;
            chillTime: string;
            maxRepeats: string;
        };
        multisig: {
            externalSigners: string[];
            minimumApprovals: string;
        };
        authEnabled: boolean;
    };
    getMessageHash(): string;
    isValid(softValidation?: boolean): boolean | Error;
    getSigners(): string[];
    getAllPaths(): string[][];
    estimateFCTCost({ callData, rpcUrl }: {
        callData: string;
        rpcUrl: string;
    }): Promise<string>;
    getKIROPayment: ({ kiroPriceInETH, gasPrice, gas, }: {
        kiroPriceInETH: string;
        gasPrice: number;
        gas: number;
    }) => {
        vault: string;
        amountInKIRO: string;
        amountInETH: string;
    };
    getPaymentPerPayer: ({ signatures, gasPrice, priceOfETHInKiro, penalty, fees, }: {
        signatures?: SignatureLike[] | undefined;
        gasPrice?: number | undefined;
        priceOfETHInKiro: string;
        penalty?: number | undefined;
        fees?: {
            baseFeeBPS: number;
            bonusFeeBPS: number;
        } | undefined;
    }) => {
        payer: string;
        amount: string;
        amountInETH: string;
    }[];
    getGasPerPayer: (fctInputData?: {
        signatures?: SignatureLike[];
    }) => {
        payer: string;
        amount: string;
    }[];
    getCallResults: ({ rpcUrl, provider, txHash, }: {
        rpcUrl?: string | undefined;
        provider?: ethers.providers.JsonRpcProvider | ethers.providers.Web3Provider | undefined;
        txHash: string;
    }) => Promise<{
        index: string;
        result: "SUCCESS" | "FAILED" | "SKIPPED";
    }[]>;
    deepValidateFCT: ({ rpcUrl, actuatorAddress, signatures, }: {
        rpcUrl: string;
        actuatorAddress: string;
        signatures: SignatureLike[];
    }) => Promise<{
        success: boolean;
        txReceipt: any;
        message: string;
    } | {
        success: boolean;
        txReceipt: null;
        message: any;
    }>;
    private validateFCTKeys;
}
