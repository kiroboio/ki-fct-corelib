import { EIP1559GasPrice, IFCT, ITxValidator, LegacyGasPrice } from "./types";
interface TransactionValidatorSuccess<T extends ITxValidator> {
    isValid: true;
    txData: T extends {
        eip1559: true;
    } ? {
        gas: number;
        type: 2;
    } & EIP1559GasPrice : {
        gas: number;
        type: 1;
    } & LegacyGasPrice;
    prices: {
        gas: number;
        gasPrice: number;
    };
    error: null;
}
interface TransactionValidatorError<T extends ITxValidator> {
    isValid: false;
    txData: T extends {
        eip1559: true;
    } ? {
        gas: number;
        type: 2;
    } & EIP1559GasPrice : {
        gas: number;
        type: 1;
    } & LegacyGasPrice;
    prices: {
        gas: number;
        gasPrice: number;
    };
    error: string;
}
type TransactionValidatorResult<T extends ITxValidator> = TransactionValidatorSuccess<T> | TransactionValidatorError<T>;
export declare const transactionValidator: <T extends ITxValidator>(txVal: T, pureGas?: boolean) => Promise<TransactionValidatorResult<T>>;
export declare const getGasPrices: ({ rpcUrl, historicalBlocks, tries, }: {
    rpcUrl: string;
    historicalBlocks?: number | undefined;
    tries?: number | undefined;
}) => Promise<Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>>;
export declare const estimateFCTGasCost: ({ fct, callData, batchMultiSigCallAddress, rpcUrl, }: {
    fct: IFCT;
    callData: string;
    batchMultiSigCallAddress: string;
    rpcUrl: string;
}) => Promise<string>;
export declare const getKIROPayment: ({ fct, kiroPriceInETH, gasPrice, gas, }: {
    fct: IFCT;
    kiroPriceInETH: string;
    gasPrice: number;
    gas: number;
}) => {
    vault: string;
    amountInKIRO: string;
    amountInETH: string;
};
export declare const getPaymentPerPayer: ({ fct, gasPrice, kiroPriceInETH, penalty, }: {
    fct: IFCT;
    gasPrice?: number | undefined;
    kiroPriceInETH: string;
    penalty?: number | undefined;
}) => {
    payer: string;
    amount: string;
    amountInETH: string;
}[];
export {};
