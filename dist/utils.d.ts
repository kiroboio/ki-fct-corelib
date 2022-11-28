import { SignatureLike } from "@ethersproject/bytes";
import { BatchMultiSigCallTypedData, MSCall } from "./batchMultiSigCall/interfaces";
interface IFCT {
    typedData: BatchMultiSigCallTypedData;
    mcall: MSCall[];
}
interface ITxValidator {
    rpcUrl: string;
    callData: string;
    actuatorPrivateKey: string;
    actuatorContractAddress: string;
    activateForFree: boolean;
    eip1559?: boolean;
    gasPriority?: "slow" | "average" | "fast";
}
export type { IFCT, ITxValidator };
declare const _default: {
    getFCTMessageHash: (typedData: BatchMultiSigCallTypedData) => string;
    validateFCT: (FCT: IFCT, softValidation?: boolean) => {
        getOptions: () => {
            valid_from: string;
            expires_at: string;
            gas_price_limit: string;
            builder: string;
        };
        getFCTMessageHash: () => string;
        getSigners: () => string[];
    };
    recoverAddressFromEIP712: (typedData: BatchMultiSigCallTypedData, signature: SignatureLike) => string;
    getVariablesAsBytes32: (variables: string[]) => string[];
    transactionValidator: (txVal: ITxValidator, pureGas?: boolean) => Promise<{
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
    getGasPriceEstimations: ({ rpcUrl, historicalBlocks }: {
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
};
export default _default;
