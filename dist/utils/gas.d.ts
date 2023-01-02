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
export declare const getGasPrices: ({ rpcUrl, historicalBlocks, }: {
    rpcUrl: string;
    historicalBlocks?: number;
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
    fastest: {
        maxFeePerGas: number;
        maxPriorityFeePerGas: number;
    };
}>;
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
    vault: any;
    amountInKIRO: string;
    amountInETH: string;
};
export declare const getMaxKIROCostPerPayer: ({ fct, kiroPriceInETH }: {
    fct: IFCT;
    kiroPriceInETH: string;
}) => {
    payer: string;
    amount: string;
}[];
