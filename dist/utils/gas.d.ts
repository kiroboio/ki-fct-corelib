import { EIP1559GasPrice, ITxValidator } from "../types";
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
export declare const getGasPrices: ({ rpcUrl, chainId: chainIdParam, historicalBlocks, tries, }: {
    rpcUrl: string;
    chainId?: number | undefined;
    historicalBlocks?: number | undefined;
    tries?: number | undefined;
}) => Promise<Record<"slow" | "average" | "fast" | "fastest", EIP1559GasPrice>>;
export {};
