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
