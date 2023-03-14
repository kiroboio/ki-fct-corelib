import { SignatureLike } from "@ethersproject/bytes";
import { BatchMultiSigCall } from "../../batchMultiSigCall";
import { FCTBase } from "../FCTBase";
export declare class FCTUtils extends FCTBase {
    private _eip712;
    constructor(FCT: BatchMultiSigCall);
    private get FCTData();
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
            minimumApprovals: string;
            externalSigners: string[];
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
    getPaymentPerPayer: ({ signatures, gasPrice, kiroPriceInETH, penalty, }: {
        signatures?: SignatureLike[] | undefined;
        gasPrice?: number | undefined;
        kiroPriceInETH: string;
        penalty?: number | undefined;
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
    private validateFCTKeys;
}
