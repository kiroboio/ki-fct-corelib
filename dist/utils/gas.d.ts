import { IFCT, ITxValidator } from "./types";
export declare const transactionValidator: (txVal: ITxValidator, pureGas?: boolean) => Promise<{
    isValid: boolean;
    txData: {
        type: number;
        maxFeePerGas: number;
        maxPriorityFeePerGas: number;
        gas: number;
    } | {
        type: number;
        gasPrice: number;
        gas: number;
    };
    prices: {
        gas: number;
        gasPrice: number;
    };
    error: any;
}>;
export declare const getGasPriceEstimations: ({ rpcUrl, historicalBlocks, }: {
    rpcUrl: string;
    historicalBlocks: number;
}) => Promise<{
    slow: {
        maxFeePerGas: number;
        maxPriorityFeePerGas: number;
    };
    average: {
        maxFeePerGas: number;
        maxPriorityFeePerGas: number;
    };
    fast: {
        maxFeePerGas: number;
        maxPriorityFeePerGas: number;
    };
}>;
export declare const getFCTGasEstimation: ({ fct, callData, batchMultiSigCallAddress, rpcUrl, }: {
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
}) => Promise<{
    vault: any;
    amount: string;
}>;
export declare const getFCTCostInKIRO: ({ fct, callData, batchMultiSigCallAddress, gasPrice, kiroPriceInETH, rpcUrl, }: {
    fct: IFCT;
    callData: string;
    batchMultiSigCallAddress: string;
    gasPrice: number;
    kiroPriceInETH: string;
    rpcUrl: string;
}) => Promise<string>;
