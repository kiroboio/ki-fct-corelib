import { EIP1559GasPrice, IFCT, ITxValidator } from "./types";
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
export declare const getGasPrices: ({ rpcUrl, historicalBlocks, tries, }: {
    rpcUrl: string;
    historicalBlocks?: number;
    tries?: number;
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
    vault: any;
    amountInKIRO: string;
    amountInETH: string;
};
export declare const getPaymentPerPayer: ({ fct, gasPrice, kiroPriceInETH, penalty, }: {
    fct: IFCT;
    gasPrice?: number;
    kiroPriceInETH: string;
    penalty?: number;
}) => {
    payer: string;
    amount: string;
    amountInETH: string;
}[];
