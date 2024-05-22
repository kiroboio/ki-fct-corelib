import { ChainId } from "@kiroboio/fct-plugins";
import { FCTUtils } from "../..";
import { Call } from "../../Call";
import { PayerPayment } from "../types";
declare const fees: {
    readonly beforeCallingBatchMultiSigCall: 5000n;
    readonly FCTControllerOverhead: 43000n;
    readonly gasBeforeEncodedLoop: 3000n;
    readonly gasForEncodingCall: 8000n;
    readonly additionalGasForEncodingCall: 100n;
    readonly FCTControllerRegisterCall: 43000n;
    readonly signatureRecovery: 6000n;
    readonly miscGasBeforeMcallLoop: 1700n;
    readonly paymentApproval: 9000n;
    readonly paymentsOutBase: 24500n;
    readonly paymentsOutPerPayment: 1300n;
    readonly totalCallsChecker: 16000n;
    readonly estimateExtraCommmonGasCost: 4000n;
    readonly mcallOverheadFirstCall: 40000n;
    readonly mcallOverheadOtherCalls: 11000n;
    readonly defaultGasLimit: 30000n;
};
export declare function getFee(key: keyof typeof fees, chainId: string): bigint;
export declare function getPayersForRoute({ chainId, calls, pathIndexes, calldata, }: {
    chainId: string;
    calls: Call[];
    pathIndexes: string[];
    calldata: string;
}): {
    payer: string;
    gas: bigint;
}[];
export declare function getEffectiveGasPrice({ maxGasPrice, gasPrice, baseFeeBPS, bonusFeeBPS, }: {
    maxGasPrice: string | bigint;
    gasPrice: string | bigint;
    baseFeeBPS: bigint;
    bonusFeeBPS: bigint;
}): string;
export declare function getCostInKiro({ ethPriceInKIRO, ethCost, }: {
    ethPriceInKIRO: string | bigint;
    ethCost: bigint | undefined;
}): string;
export declare function getGasPrices({ maxGasPrice, gasPrice, baseFeeBPS, bonusFeeBPS, }: {
    maxGasPrice: bigint;
    gasPrice: bigint;
    baseFeeBPS: bigint;
    bonusFeeBPS: bigint;
}): {
    txGasPrice: bigint;
    effectiveGasPrice: bigint;
};
export declare function getPayerMap({ chainId, paths, calldata, calls, gasPrice, maxGasPrice, baseFeeBPS, bonusFeeBPS, penalty, }: {
    chainId: ChainId;
    paths: ReturnType<FCTUtils["getAllPaths"]>;
    calldata: string;
    calls: Call[];
    gasPrice: bigint;
    maxGasPrice: bigint;
    baseFeeBPS: bigint;
    bonusFeeBPS: bigint;
    penalty?: number | string;
}): Record<string, PayerPayment>[];
export declare function preparePaymentPerPayerResult({ payerMap, senders, ethPriceInKIRO, }: {
    payerMap: Record<string, PayerPayment>[];
    senders: string[];
    ethPriceInKIRO: string | bigint;
}): {
    payer: string;
    largestPayment: {
        gas: string;
        tokenAmountInWei: string;
        nativeAmountInWei: string;
        tokenAmount: string;
        nativeAmount: string;
    };
    smallestPayment: {
        gas: string;
        tokenAmountInWei: string;
        nativeAmountInWei: string;
        tokenAmount: string;
        nativeAmount: string;
    };
}[];
export {};
//# sourceMappingURL=getPaymentPerPayer.d.ts.map