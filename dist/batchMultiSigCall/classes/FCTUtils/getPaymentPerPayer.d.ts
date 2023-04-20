import { MSCall } from "../../types";
export declare function getTotalApprovalCalls(pathIndexes: string[], calls: any[]): void;
export declare function getPayersForRoute({ calls, pathIndexes, calldata, signatureCount, }: {
    calls: MSCall[];
    pathIndexes: string[];
    calldata: string;
    signatureCount: number;
}): {
    payer: string;
    gas: bigint;
}[];
export declare function getEffectiveGasPrice({ maxGasPrice, gasPrice, }: {
    maxGasPrice: string | bigint;
    gasPrice: string | bigint;
}): string;
