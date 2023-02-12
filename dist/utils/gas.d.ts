import { EIP1559GasPrice, ITxValidator } from "@types";
import { IBatchMultiSigCallFCT, PartialBatchMultiSigCall } from "../batchMultiSigCall/types";
interface TransactionValidatorSuccess {
    isValid: true;
    txData: {
        gas: number;
        type: 2;
    } & EIP1559GasPrice;
    prices: {
        gas: number;
        gasPrice: number;
    };
    error: null;
}
interface TransactionValidatorError {
    isValid: false;
    txData: {
        gas: number;
        type: 2;
    } & EIP1559GasPrice;
    prices: {
        gas: number;
        gasPrice: number;
    };
    error: string;
}
type TransactionValidatorResult = TransactionValidatorSuccess | TransactionValidatorError;
export declare const transactionValidator: (txVal: ITxValidator, pureGas?: boolean) => Promise<TransactionValidatorResult>;
export declare const getGasPrices: ({ rpcUrl, historicalBlocks, tries, }: {
    rpcUrl: string;
    historicalBlocks?: number | undefined;
    tries?: number | undefined;
}) => Promise<Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>>;
export declare const estimateFCTGasCost: ({ fct, callData, batchMultiSigCallAddress, rpcUrl, }: {
    fct: PartialBatchMultiSigCall;
    callData: string;
    batchMultiSigCallAddress: string;
    rpcUrl: string;
}) => Promise<string>;
export declare const getKIROPayment: ({ fct, kiroPriceInETH, gasPrice, gas, }: {
    fct: PartialBatchMultiSigCall;
    kiroPriceInETH: string;
    gasPrice: number;
    gas: number;
}) => {
    vault: string;
    amountInKIRO: string;
    amountInETH: string;
};
export declare const getPaymentPerPayer: ({ fct, gasPrice, kiroPriceInETH, penalty, }: {
    fct: IBatchMultiSigCallFCT;
    gasPrice?: number | undefined;
    kiroPriceInETH: string;
    penalty?: number | undefined;
}) => {
    payer: string;
    amount: string;
    amountInETH: string;
}[];
export {};
